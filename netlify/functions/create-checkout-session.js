// create-checkout-session.js — DEBUG VERSION
import Stripe from "stripe";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });
const firestore = admin.firestore();
const auth = admin.auth();

export async function handler(event) {
  console.log("[TGK] create-checkout-session CALLED");
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const { email, password } = JSON.parse(event.body || "{}");
  console.log("[TGK] Input:", { email, password: password ? "set" : "missing" });

  if (!email || !password) return json(400, { error: "Missing email or password" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. CREATE USER
    let uid;
    try {
      const userRecord = await auth.createUser({ email: normalizedEmail, password });
      uid = userRecord.uid;
      console.log(`[TGK] Server created user: ${uid}`);
    } catch (createErr) {
      if (createErr.code === "auth/email-already-exists") {
        const userRecord = await auth.getUserByEmail(normalizedEmail);
        uid = userRecord.uid;
        console.log(`[TGK] User exists: ${uid}`);
      } else {
        console.error("[TGK] createUser error:", createErr);
        throw createErr;
      }
    }

    // 2. CHECK ENTITLEMENT
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();
    if (entSnap.exists && entSnap.data().stripeCustomerId) {
      console.log(`[TGK] Entitlement exists → reusing: ${entSnap.data().stripeCustomerId}`);
      return json(200, { success: true, uid, customerId: entSnap.data().stripeCustomerId, tier: "free", exists: true });
    }

    // 3. STRIPE CUSTOMER
    console.log("[TGK] Looking for existing Stripe customer...");
    const existing = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    console.log("[TGK] Stripe list result:", existing.data.length > 0 ? existing.data[0].id : "none");

    let customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
      console.log(`[TGK] Reusing Stripe: ${customer.id}`);
    } else {
      console.log("[TGK] Creating new Stripe customer...");
      customer = await stripe.customers.create({
        email: normalizedEmail,
        metadata: { firebase_uid: uid },
      });
      console.log(`[TGK] Created Stripe: ${customer.id}`);
    }

    // 4. WRITE ENTITLEMENT
    const payload = {
      uid,
      email: normalizedEmail,
      stripeCustomerId: customer.id,
      tier: "free",
      created: admin.firestore.FieldValue.serverTimestamp(),
      lastLinked: admin.firestore.FieldValue.serverTimestamp(),
    };
    await entRef.set(payload, { merge: true });
    console.log(`[TGK] Entitlement written: ${uid} → ${customer.id}`);

    return json(200, { success: true, uid, customerId: customer.id, tier: "free", exists: false });

  } catch (err) {
    console.error("[TGK] FATAL ERROR:", err);
    return json(500, { error: err.message });
  }
}

function json(status, body) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
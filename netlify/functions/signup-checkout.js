// .netlify/functions/signup-checkout.js
// v1.0 — SIGNUP + STRIPE CUSTOMER (no checkout)

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const firestore = admin.firestore();
const auth = admin.auth();

export async function handler(event) {
  console.log("[Signup] create-checkout-session CALLED");
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const { email, password } = JSON.parse(event.body || "{}");
  console.log("[Signup] Input:", { email, password: password ? "set" : "missing" });

  if (!email || !password) return json(400, { error: "Missing email or password" });

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. CREATE OR GET USER
    let uid;
    try {
      const userRecord = await auth.createUser({ email: normalizedEmail, password });
      uid = userRecord.uid;
      console.log(`[Signup] Created user: ${uid}`);
    } catch (createErr) {
      if (createErr.code === "auth/email-already-exists") {
        const userRecord = await auth.getUserByEmail(normalizedEmail);
        uid = userRecord.uid;
        console.log(`[Signup] User exists: ${uid}`);
      } else {
        throw createErr;
      }
    }

    // 2. CHECK ENTITLEMENT
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();
    if (entSnap.exists && entSnap.data().stripeCustomerId) {
      console.log(`[Signup] Entitlement exists → reusing: ${entSnap.data().stripeCustomerId}`);
      return json(200, { success: true, uid, customerId: entSnap.data().stripeCustomerId, tier: "free", exists: true });
    }

    // 3. STRIPE CUSTOMER
    const existing = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    let customer;
    if (existing.data.length > 0) {
      customer = existing.data[0];
      console.log(`[Signup] Reusing Stripe: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email: normalizedEmail,
        metadata: { firebase_uid: uid },
      });
      console.log(`[Signup] Created Stripe: ${customer.id}`);
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
    console.log(`[Signup] Entitlement written: ${uid} → ${customer.id}`);

    return json(200, { success: true, uid, customerId: customer.id, tier: "free", exists: false });

  } catch (err) {
    console.error("[Signup] FATAL ERROR:", err);
    return json(500, { error: err.message });
  }
}

function json(status, body) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
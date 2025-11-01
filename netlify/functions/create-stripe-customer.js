// 🜂 TGK — Netlify Function: Create Stripe Customer
// Links Firebase users to Stripe + Firestore entitlements
// Version: 3.6 (Basil-verified, 2025-08-27)

import Stripe from "stripe";
import admin from "firebase-admin";

// 🜂 Firebase Admin Init (secure 3-var method)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase credentials in environment");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");

const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
const firestore = admin.firestore();

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return json(405, { error: "Method Not Allowed" });

    const { email, token } = JSON.parse(event.body || "{}");
    if (!email || !token)
      return json(400, { error: "Missing email or token" });

    // 🔐 Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 🔎 Check Firestore entitlement
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();

    if (entSnap.exists) {
      const existing = entSnap.data();
      return json(200, {
        message: "Customer already exists",
        customerId: existing.stripeCustomerId || null,
      });
    }

    // 🪪 Create or fetch Stripe customer
    const lookup = await stripe.customers.list({ email, limit: 1 });
    const customer =
      lookup.data.length > 0
        ? lookup.data[0]
        : await stripe.customers.create({
            email,
            metadata: { firebaseUID: uid, tier: "free" },
          });

    // 🜂 Write entitlement
    const entitlement = {
      uid,
      email,
      stripeCustomerId: customer.id,
      tier: "free",
      created: admin.firestore.FieldValue.serverTimestamp(),
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
    };
    await entRef.set(entitlement, { merge: true });

    console.log(`[TGK] ✅ Customer linked: ${email} → ${customer.id}`);
    return json(200, { success: true, customerId: customer.id });
  } catch (err) {
    console.error("[TGK] ❌ create-stripe-customer error:", err);
    return json(500, { error: err.message || "Server error" });
  }
};

// 🜂 Helper
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

import Stripe from "stripe";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY missing" }),
    };
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const { email, token } = JSON.parse(event.body || "{}");

  if (!token || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing token or email" }) };
  }

  try {
    // 🔐 Verify Firebase token → get UID
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 🪪 Create or retrieve existing Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer =
      existing.data.length > 0
        ? existing.data[0]
        : await stripe.customers.create({
            email,
            metadata: { firebase_uid: uid },
          });

    // 🜂 Write customer record → Firestore entitlement
    const db = admin.firestore();
    await db.collection("entitlements").doc(uid).set(
      {
        email,
        customerId: customer.id,
        tier: "free",
        created: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        uid,
        customerId: customer.id,
      }),
    };
  } catch (err) {
    console.error("[Stripe create-customer] Error:", err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
}

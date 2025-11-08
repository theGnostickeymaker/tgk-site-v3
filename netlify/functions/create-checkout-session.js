// .netlify/functions/create-checkout-session.js
// v1.0 — UPGRADE FLOW (logged-in users only)

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
const auth = admin.auth();
const firestore = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  const { priceId, uid, email, returnUrl } = JSON.parse(event.body || "{}");

  console.log("[Checkout] Upgrade request:", { uid, email, priceId, returnUrl });

  if (!priceId || !uid || !email) {
    return json(400, { error: "Missing priceId, uid, or email" });
  }

  try {
    // 1. VERIFY USER EXISTS
    const userRecord = await auth.getUser(uid);
    if (userRecord.email !== email) {
      return json(403, { error: "Email mismatch" });
    }

    // 2. GET OR CREATE STRIPE CUSTOMER
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();

    let customerId;
    if (entSnap.exists && entSnap.data().stripeCustomerId) {
      customerId = entSnap.data().stripeCustomerId;
      console.log("[Checkout] Reusing customer:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebase_uid: uid }
      });
      customerId = customer.id;
      await entRef.set({ stripeCustomerId: customerId }, { merge: true });
      console.log("[Checkout] Created customer:", customerId);
    }

    // 3. CREATE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?session=success`,
      cancel_url: `${returnUrl}?session=cancel`,
      metadata: { firebase_uid: uid, action: "upgrade" }
    });

    console.log("[Checkout] Session created:", session.id);

    return json(200, { sessionId: session.id });

  } catch (err) {
    console.error("[Checkout] ERROR:", err);
    return json(500, { error: err.message });
  }
}

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}
// .netlify/functions/create-checkout-session.js
// v2.0 — Unified TGK Upgrade Flow (Dashboard Return)

import Stripe from "stripe";
import admin from "firebase-admin";

// 🔹 Initialise Firebase Admin
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

  const { priceId, uid, email } = JSON.parse(event.body || "{}");
  const site = process.env.SITE_URL || process.env.URL || "https://thegnostickey.com";

  console.log("[Checkout] Upgrade request:", { uid, email, priceId });

  if (!priceId || !uid || !email) {
    return json(400, { error: "Missing priceId, uid, or email" });
  }

  try {
    // 1️⃣ Verify Firebase user
    const userRecord = await auth.getUser(uid);
    if (userRecord.email !== email) {
      return json(403, { error: "Email mismatch" });
    }

    // 2️⃣ Get or create Stripe customer
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();

    let customerId;
    if (entSnap.exists && entSnap.data().stripeCustomerId) {
      customerId = entSnap.data().stripeCustomerId;
      console.log("[Checkout] Reusing customer:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebase_uid: uid },
      });
      customerId = customer.id;
      await entRef.set({ stripeCustomerId: customerId }, { merge: true });
      console.log("[Checkout] Created new customer:", customerId);
    }

    // 3️⃣ Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/dashboard/?session=success`,
      cancel_url: `${site}/dashboard/?session=cancel`,
      metadata: { firebase_uid: uid, action: "upgrade" },
    });

    console.log("[Checkout] Session created:", session.id);

    return json(200, { sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("[Checkout] ERROR:", err);
    return json(500, { error: err.message });
  }
}

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

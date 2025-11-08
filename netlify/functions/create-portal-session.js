// .netlify/functions/create-portal-session.js
// v2.0 — Unified TGK Billing Portal (Dashboard Return)

import Stripe from "stripe";
import admin from "firebase-admin";

// 🔹 Firebase Admin Initialisation
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const firestore = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  try {
    const { email, token } = JSON.parse(event.body || "{}");
    if (!email && !token) return json(400, { error: "Missing email or token" });

    // 1️⃣ Verify Firebase token to get UID
    let uid = null;
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
      } catch {
        console.warn("[TGK] ⚠ Invalid Firebase token for portal");
      }
    }

    // 2️⃣ Resolve Stripe customer ID
    let customerId = null;

    if (uid) {
      const snap = await firestore.collection("entitlements").doc(uid).get();
      if (snap.exists && snap.data().stripeCustomerId)
        customerId = snap.data().stripeCustomerId;
    }

    if (!customerId && email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length) customerId = existing.data[0].id;
    }

    if (!customerId) return json(404, { error: "No Stripe customer found" });

    // 3️⃣ Create Billing Portal session
    const site = process.env.SITE_URL || process.env.URL || "https://thegnostickey.com";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${site}/dashboard/?portal=return`,
    });

    console.log(`[TGK] ✅ Billing portal created → ${email} (${customerId})`);
    return json(200, { url: session.url });
  } catch (err) {
    console.error("[TGK] ❌ create-portal-session error:", err);
    return json(500, { error: err.message });
  }
};

function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

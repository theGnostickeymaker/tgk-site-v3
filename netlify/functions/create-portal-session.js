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
    return json(405, { error: "Method not allowed" });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "STRIPE_SECRET_KEY missing" });

  const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });

  try {
    const { token, email, returnUrl } = JSON.parse(event.body || "{}");

    if (!token && !email) {
      return json(400, { error: "Missing Firebase token or email" });
    }

    // 🔐 Verify Firebase token if provided
    let uid = null;
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
      } catch {
        console.warn("[TGK Portal] Invalid Firebase token");
      }
    }

    // 🪪 Try Firestore mapping first
    let customerId = null;
    if (uid) {
      const snap = await admin.firestore().collection("entitlements").doc(uid).get();
      if (snap.exists && snap.data().customerId) {
        customerId = snap.data().customerId;
      }
    }

    // 🕵️ Otherwise, fallback to email lookup
    if (!customerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length) customerId = customers.data[0].id;
    }

    if (!customerId) return json(404, { error: "Stripe customer not found" });

    const site = process.env.SITE_URL || "http://localhost:8888";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${site}/account/`,
    });

    return json(200, { url: session.url });
  } catch (err) {
    console.error("[TGK Portal] Error:", err);
    return json(500, { error: err.message || "Server error" });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

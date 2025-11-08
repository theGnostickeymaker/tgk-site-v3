// 🜂 TGK — Create Stripe Billing Portal Session
// Version 3.7 (Basil Standard)
import Stripe from "stripe";
import admin from "firebase-admin";

// ✅ Firebase Admin init
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const firestore = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return json(405, { error: "Method Not Allowed" });

  try {
    const { email, token } = JSON.parse(event.body || "{}");
    if (!email && !token)
      return json(400, { error: "Missing email or token" });

    // 🔹 Verify Firebase token to get UID
    let uid = null;
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
      } catch {
        console.warn("[TGK] ⚠ Invalid Firebase token for portal");
      }
    }

    // 🔹 Resolve Stripe customer ID
    let customerId = null;

    // Check entitlement record first
    if (uid) {
      const snap = await firestore.collection("entitlements").doc(uid).get();
      if (snap.exists && snap.data().stripeCustomerId)
        customerId = snap.data().stripeCustomerId;
    }

    // Fallback by email lookup
    if (!customerId && email) {
      const existing = await stripe.customers.list({ email, limit: 1 });
      if (existing.data.length) customerId = existing.data[0].id;
    }

    if (!customerId) return json(404, { error: "No Stripe customer found" });

    // 🔹 Create Stripe Billing Portal session
    const site = process.env.SITE_URL || "http://localhost:8888";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: site + "/account/"
    });

    console.log(`[TGK] ✅ Portal session created for ${email} → ${customerId}`);
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

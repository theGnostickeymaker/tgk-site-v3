// 🜂 TGK — Netlify Function: Set Entitlements
// Synchronises Stripe subscription tier → Firestore entitlement
// Version: 3.6 (Basil-verified, 2025-08-27)

import admin from "firebase-admin";
import Stripe from "stripe";

// 🜂 Secure Firebase Admin Init
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const parseList = (s) => (s || "").split(",").map((v) => v.trim()).filter(Boolean);
const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return json(405, { error: "Method Not Allowed" });

  try {
    const { session_id, token, email, customerId } = JSON.parse(event.body || "{}");
    if (!session_id && !token && !customerId)
      return json(400, { error: "Missing session_id, token, or customerId" });

    // 🔐 Verify Firebase user
    let uid = null;
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
      } catch {
        console.warn("[TGK] ⚠ Invalid Firebase token");
      }
    }

    // 🪪 Resolve Stripe customer
    let stripeCustomerId = customerId;
    if (session_id && !stripeCustomerId) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
      stripeCustomerId = checkoutSession.customer;
    }

    if (!stripeCustomerId && uid) {
      const entSnap = await firestore.collection("entitlements").doc(uid).get();
      if (entSnap.exists) stripeCustomerId = entSnap.data().stripeCustomerId;
    }

    if (!stripeCustomerId)
      return json(404, { error: "Stripe customer not found" });

    // 🧾 Get active subscription and map tier
    let tier = "free";
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    const priceId = subs.data?.[0]?.items?.data?.[0]?.price?.id;
    if (INITIATE_IDS.includes(priceId)) tier = "initiate";
    if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";

    // 🜂 Write to Firestore — always keyed by Firebase UID
    if (!uid) {
      console.warn("[TGK] ⚠ No Firebase UID available; entitlement not written.");
      return json(400, { error: "Missing UID for entitlement write" });
    }

    // Get email from the Stripe customer object safely
    let resolvedEmail = email;
    if (!resolvedEmail && stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if ("email" in customer && customer.email) {
          resolvedEmail = customer.email;
        } else {
          console.warn(`[TGK] ⚠ Stripe customer ${stripeCustomerId} has no email field`);
        }
      } catch (err) {
        console.warn("[TGK] ⚠ Unable to resolve customer email:", err.message);
      }
    }

    const entitlement = {
      uid,
      email: resolvedEmail,
      stripeCustomerId,
      tier,
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection("entitlements").doc(uid).set(entitlement, { merge: true });

    console.log(`[TGK] ✅ Entitlement updated for ${resolvedEmail || stripeCustomerId}: ${tier}`);
    return json(200, { success: true, tier, message: "Entitlement updated" });
  } catch (err) {
    console.error("[TGK] ❌ set-entitlements error:", err);
    return json(500, { error: err.message, message: "Server error" });
  }
};

// 🜂 JSON Helper
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// 🜂 Environment Safety Check
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[TGK] ⚠ STRIPE_SECRET_KEY missing in environment");
}

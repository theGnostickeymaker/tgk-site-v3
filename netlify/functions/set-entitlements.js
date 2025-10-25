// 🜂 TGK — Set Entitlements (Admin / Webhook)
// Updates Firestore with user's current tier and Stripe IDs.

import admin from "firebase-admin";
import Stripe from "stripe";

// 🜂 Ensure Firebase Admin initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY))
  });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🜂 Price ID Lists
const INITIATE_IDS = (process.env.PRICE_INITIATE_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const FULL_IDS = (process.env.PRICE_FULL_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const FULL_LIFEIDS = (process.env.PRICE_FULL_LIFETIME_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// 🜂 Main Handler
export const handler = async (event) => {
  try {
    const { customerId, email } = JSON.parse(event.body || "{}");
    if (!customerId) return json(400, { error: "missing customerId" });

    // 🔹 Get active subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1
    });

    const sub = subs.data[0];
    const priceId = sub?.items?.data?.[0]?.price?.id || null;

    // 🔹 Determine tier from price ID
    let tier = "free";
    if (INITIATE_IDS.includes(priceId)) tier = "initiate";
    if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";

    // 🔹 Fetch customer safely (email not always present)
    let customerEmail = "unknown";
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && typeof customer === "object" && "email" in customer) {
        customerEmail = customer.email ?? "unknown";
      }
    } catch (err) {
      console.warn(`[TGK] ⚠ Could not fetch Stripe customer email for ${customerId}:`, err.message);
    }

    // 🔹 Prepare Firestore data
    const data = {
      email: email || customerEmail,
      stripeCustomerId: customerId,
      tier,
      lastChecked: new Date()
    };

    await firestore.collection("entitlements").doc(customerId).set(data, { merge: true });

    console.log(`[TGK] ✅ Entitlement updated for ${data.email} (${customerId}): ${tier}`);
    return json(200, { tier, message: "Entitlement updated" });
  } catch (e) {
    console.error("[TGK] ❌ set-entitlements error:", e);
    return json(500, { error: e.message || "server" });
  }
};

// 🜂 Helper: JSON Response Wrapper
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

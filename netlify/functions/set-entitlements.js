// 🜂 TGK — Set Entitlements (Admin / Webhook)
// Updates Firestore with user's current tier and Stripe IDs.

import admin from "firebase-admin";
import Stripe from "stripe";

// 🜂 Firebase Admin Init (3-var secure method)
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

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🜂 Price ID Groups
const parseList = (s) => (s || "").split(",").map(v => v.trim()).filter(Boolean);
const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

// 🜂 Main Handler
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return json(405, { error: "Method Not Allowed" });

    const { customerId, email } = JSON.parse(event.body || "{}");
    if (!customerId) return json(400, { error: "Missing customerId" });

    // 🔹 Retrieve Stripe subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const sub = subs.data[0];
    const priceId = sub?.items?.data?.[0]?.price?.id;

    // 🔹 Determine tier
    let tier = "free";
    if (INITIATE_IDS.includes(priceId)) tier = "initiate";
    if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";

    // 🔹 Safely get Stripe customer email
    let customerEmail = "unknown";
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && typeof customer === "object" && "email" in customer) {
        customerEmail = customer.email ?? "unknown";
      }
    } catch (err) {
      console.warn(`[TGK] ⚠ Could not fetch Stripe customer email for ${customerId}: ${err.message}`);
    }

    // 🔹 Write entitlement record
    const data = {
      email: email || customerEmail,
      stripeCustomerId: customerId,
      tier,
      lastChecked: admin.firestore.Timestamp.now(),
    };

    await firestore.collection("entitlements").doc(customerId).set(data, { merge: true });

    console.log(`[TGK] ✅ Entitlement updated for ${data.email} (${customerId}): ${tier}`);
    return json(200, { tier, message: "Entitlement updated" });
  } catch (err) {
    console.error("[TGK] ❌ set-entitlements error:", err);
    return json(500, { error: err.message || "Server Error" });
  }
};

// 🜂 JSON Helper
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

import admin from "firebase-admin";
import Stripe from "stripe";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const parseList = (s) => (s || "").split(",").map(v => v.trim()).filter(Boolean);
const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return json(405, { error: "Method Not Allowed" });

  try {
    const { uid, customerId, email } = JSON.parse(event.body || "{}");
    if (!customerId && !uid) return json(400, { error: "Missing uid or customerId" });

    // Retrieve active subscription
    let tier = "free";
    if (customerId) {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
      const priceId = subs.data[0]?.items?.data?.[0]?.price?.id;
      if (INITIATE_IDS.includes(priceId)) tier = "initiate";
      if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";
    }

    const docId = uid || customerId;
    const data = {
      email,
      stripeCustomerId: customerId || null,
      tier,
      lastChecked: admin.firestore.Timestamp.now(),
    };

    await firestore.collection("entitlements").doc(docId).set(data, { merge: true });

    console.log(`[TGK] ✅ Entitlement updated for ${email} (${docId}): ${tier}`);
    return json(200, { tier, message: "Entitlement updated" });
  } catch (err) {
    console.error("[TGK] ❌ set-entitlements error:", err);
    return json(500, { error: err.message });
  }
};

function json(status, body) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[TGK] ⚠ STRIPE_SECRET_KEY missing in environment");
}

// netlify/functions/stripe-webhook.js
// TGK Stripe Webhook (Netlify Functions, CommonJS)

const Stripe = require("stripe");
const admin = require("firebase-admin");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const parseList = (s) =>
  (s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const ADEPT_IDS = parseList(process.env.PRICE_FULL_IDS);
const ADEPT_LIFE_IDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

function tierFromPriceIds(priceIds) {
  let tier = "free";

  if (priceIds.some((id) => INITIATE_IDS.includes(id))) tier = "initiate";
  if (priceIds.some((id) => ADEPT_IDS.includes(id) || ADEPT_LIFE_IDS.includes(id))) tier = "adept";

  return tier;
}

function isCovered(sub) {
  // Do not instantly lock people out on a failed payment
  const coveredStatuses = new Set(["active", "trialing", "past_due", "unpaid"]);
  if (!coveredStatuses.has(sub.status)) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof sub.current_period_end === "number" && sub.current_period_end > nowSec) return true;

  return sub.status === "active" || sub.status === "trialing";
}

async function bestEntitlementFromStripe(stripe, customerId) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
    expand: ["data.items.data.price"],
  });

  const covered = (subs.data || []).filter(isCovered);

  if (!covered.length) return { tier: "free", subscription: null, priceIds: [] };

  const priceIds = covered.flatMap((s) =>
    (s.items?.data || []).map((it) => it.price?.id).filter(Boolean)
  );

  return { tier: tierFromPriceIds(priceIds), subscription: covered[0], priceIds };
}

async function updateEntitlements({ db, auth, customerId, tier, subscription }) {
  const snap = await db
    .collection("entitlements")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (snap.empty) {
    console.warn(`[TGK][Webhook] No entitlements doc for customerId=${customerId}`);
    return;
  }

  const doc = snap.docs[0];
  const uid = doc.id;

  await db.collection("entitlements").doc(uid).set(
    {
      tier,
      role: tier,
      stripeCustomerId: customerId,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  if (subscription) {
    await db.collection("subscriptions").doc(uid).set(
      {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: !!subscription.cancel_at_period_end,
        priceId: subscription.items?.data?.[0]?.price?.id || null,
        currentPeriodEnd: admin.firestore.Timestamp.fromMillis(
          (subscription.current_period_end || 0) * 1000
        ),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await db.collection("subscriptions").doc(uid).set(
      {
        stripeCustomerId: customerId,
        stripeSubscriptionId: null,
        status: "none",
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await auth.setCustomUserClaims(uid, { tier, role: tier });

  console.log(`[TGK][Webhook] Synced uid=${uid} tier=${tier}`);
}

exports.handler = async (event) => {
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || "").trim();

  if (!webhookSecret) return json(500, { error: "Missing STRIPE_WEBHOOK_SECRET" });
  if (!stripeSecretKey) return json(500, { error: "Missing STRIPE_SECRET_KEY" });

  // Firebase Admin init
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.error("[TGK][Webhook] Missing Firebase Admin env vars");
      return json(500, { error: "Missing Firebase Admin env vars" });
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  const db = admin.firestore();
  const fbAuth = admin.auth();
  const stripe = new Stripe(stripeSecretKey);

  const sig = event.headers["stripe-signature"];
  if (!sig) return json(400, { error: "Missing stripe-signature header" });

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
    : Buffer.from(event.body || "", "utf8");

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    console.error("[TGK][Webhook] Signature verification failed:", e.message);
    return json(400, { error: `Webhook signature error: ${e.message}` });
  }

  const obj = stripeEvent.data?.object || {};
  const customerId = obj.customer || null;

  if (!customerId) {
    console.warn("[TGK][Webhook] No customerId on event:", stripeEvent.type);
    return json(200, { received: true, note: "no_customer" });
  }

  const relevant = new Set([
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
  ]);

  if (!relevant.has(stripeEvent.type)) {
    return json(200, { received: true, ignored: stripeEvent.type });
  }

  try {
    const { tier, subscription } = await bestEntitlementFromStripe(stripe, customerId);

    await updateEntitlements({
      db,
      auth: fbAuth,
      customerId,
      tier,
      subscription,
    });

    return json(200, { received: true, type: stripeEvent.type, customerId, tier });
  } catch (e) {
    console.error("[TGK][Webhook] Processing error:", e);
    return json(500, { error: "Webhook handler error" });
  }
};

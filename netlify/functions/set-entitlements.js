/* ==========================================================
   🔥 TGK — Entitlements Sync (Upgrade-Only Edition)
   Prevents automatic downgrades except on explicit cancellation
   ========================================================== */

import admin from "firebase-admin";
import Stripe from "stripe";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const firestore = admin.firestore();
const auth = admin.auth();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

const parseList = s => (s || "").split(",").map(v => v.trim()).filter(Boolean);
const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid JSON" }); }

  const { token, uid, email, customerId, session_id } = body;
  console.log("[TGK] ⇄ Entitlement check:", { uid, email });

  try {
    /* 1. Verify token (if present) */
    let firebaseUid = uid;
    let claims = {};

    if (token) {
      try {
        const decoded = await auth.verifyIdToken(token);
        firebaseUid = decoded.uid;
        claims = decoded;
      } catch (err) {
        console.warn("[TGK] Token verify failed:", err.message);
      }
    }

    if (!firebaseUid) return json(400, { error: "Missing Firebase UID" });

    /* 2. Load existing Firestore entitlements */
    const entRef = firestore.collection("entitlements").doc(firebaseUid);
    const entSnap = await entRef.get();
    let existing = entSnap.exists ? entSnap.data() : {};
    let existingTier = existing.tier || "free";

    /* 3. Admin override — never touched */
    if (email === "the.keymaker@thegnostickey.com") {
      await auth.setCustomUserClaims(firebaseUid, { tier: "admin", role: "admin" });
      await entRef.set({ tier: "admin", role: "admin", email }, { merge: true });
      return json(200, { tier: "admin", role: "admin", override: true });
    }

    /* 4. Resolve Stripe customer */
    let stripeCustomerId = customerId || existing.stripeCustomerId || null;

    if (session_id && !stripeCustomerId) {
      try {
        const checkout = await stripe.checkout.sessions.retrieve(session_id);
        stripeCustomerId = checkout.customer;
      } catch { /* ignore */ }
    }

    if (!stripeCustomerId) {
      console.warn("[TGK] No Stripe customer found. Leaving tier unchanged:", existingTier);
      return json(200, { success: true, tier: existingTier, role: existingTier, stripeCustomerId });
    }

    /* 5. Check Stripe subscription */
    let newTier = "free";
    let subscriptionStatus = "none";

    try {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        limit: 1
      });

      if (subs.data.length > 0) {
        const sub = subs.data[0];
        subscriptionStatus = sub.status;

        const priceId = sub.items.data[0].price.id;

        if (INITIATE_IDS.includes(priceId)) newTier = "initiate";
        if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) newTier = "adept";
      }
    } catch (err) {
      console.warn("[TGK] Stripe subscription lookup failed:", err.message);
    }

    /* ======================================================
       6. UPGRADE-ONLY LOGIC
       ====================================================== */

    const tierOrder = { free: 0, initiate: 1, adept: 2 };
    const existingRank = tierOrder[existingTier] ?? 0;
    const newRank = tierOrder[newTier] ?? 0;

    let finalTier = existingTier;

    if (newRank > existingRank) {
      // Upgrade
      finalTier = newTier;
    } else if (subscriptionStatus === "canceled") {
      // Explicit downgrade allowed
      finalTier = "free";
    } else {
      // Ignore unintended downgrade
      console.log(`[TGK] Prevented downgrade attempt: existing ${existingTier} > Stripe ${newTier}`);
    }

    const finalRole = finalTier;

    /* 7. Write updates */
    await entRef.set({
      tier: finalTier,
      role: finalRole,
      stripeCustomerId,
      email,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    /* 8. Update Firebase claims */
    await auth.setCustomUserClaims(firebaseUid, { tier: finalTier, role: finalRole });

    return json(200, {
      success: true,
      uid: firebaseUid,
      tier: finalTier,
      role: finalRole,
      stripeCustomerId,
      subscriptionStatus,
    });

  } catch (err) {
    console.error("[TGK] Entitlements fatal:", err);
    return json(500, { error: err.message });
  }
};

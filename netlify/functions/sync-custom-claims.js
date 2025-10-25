/* ===========================================================
   🜂 TGK — Netlify Function: sync-custom-claims.js
   Purpose:
   Keeps Firebase Auth → Firestore → Stripe tier data in sync.
   Ensures each user’s Firebase ID token contains { tier, role }.
   =========================================================== */

import admin from "firebase-admin";
import Stripe from "stripe";

// 🜂 Initialize Firebase Admin once
if (!admin.apps.length) {
  let raw = process.env.FIREBASE_ADMIN_KEY_B64 || process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("FIREBASE_ADMIN_KEY missing");
  if (!raw.trim().startsWith("{")) {
    raw = Buffer.from(raw, "base64").toString("utf8");
  }
  const credentials = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ===========================================================
   🔹 Handler
   =========================================================== */
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return json(405, { error: "Method Not Allowed" });

    const { uid, email, customerId } = JSON.parse(event.body || "{}");
    if (!uid && !email) return json(400, { error: "Missing uid or email" });

    // 🔹 Fetch entitlement
    let entitlement = null;
    if (uid) {
      const doc = await firestore.collection("entitlements").doc(uid).get();
      entitlement = doc.exists ? doc.data() : null;
    } else if (email) {
      const snap = await firestore.collection("entitlements").where("email", "==", email).limit(1).get();
      entitlement = !snap.empty ? snap.docs[0].data() : null;
    }

    let tier = entitlement?.tier || "free";
    let role = entitlement?.role || (tier === "admin" ? "admin" : "member");

    // 🔹 Double-check with Stripe (optional)
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1
      });
      const priceId = subs.data[0]?.items?.data?.[0]?.price?.id;
      const INITIATE_IDS = (process.env.PRICE_INITIATE_IDS || "").split(",").map(s => s.trim());
      const FULL_IDS = (process.env.PRICE_FULL_IDS || "").split(",").map(s => s.trim());
      const FULL_LIFEIDS = (process.env.PRICE_FULL_LIFETIME_IDS || "").split(",").map(s => s.trim());

      if (INITIATE_IDS.includes(priceId)) tier = "initiate";
      if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";
    }

    // 🔹 Update custom claims
    const userRecord = uid
      ? await admin.auth().getUser(uid)
      : await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(userRecord.uid, { tier, role });

    console.log(`[TGK] ✅ Synced custom claims for ${email || uid}: ${tier}/${role}`);
    return json(200, { message: "Claims synced", uid: userRecord.uid, tier, role });

  } catch (err) {
    console.error("[TGK] ❌ sync-custom-claims error:", err);
    return json(500, { error: err.message });
  }
};

/* ===========================================================
   🔹 Helper
   =========================================================== */
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

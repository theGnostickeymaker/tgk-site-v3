// ==========================================================
// 🜂 TGK — Netlify Function: Set Entitlements (Live + Claims Sync)
// v5.0  — 2025-11-08  (Realtime fix + Admin override + Role/Tier sync)
// ==========================================================

import admin from "firebase-admin";
import Stripe from "stripe";

/* ----------------------------------------------------------
   🔹 Initialise Firebase / Stripe
---------------------------------------------------------- */
if (!admin.apps.length) {
  const projectId    = process.env.FIREBASE_PROJECT_ID;
  const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey   = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new Error("Missing Firebase credentials");
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}
const firestore = admin.firestore();
const auth      = admin.auth();
const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

/* ----------------------------------------------------------
   🔹 Helpers
---------------------------------------------------------- */
const parseList = s => (s || "").split(",").map(v => v.trim()).filter(Boolean);
const INITIATE_IDS  = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS      = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS  = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/* ----------------------------------------------------------
   🔹 Main handler
---------------------------------------------------------- */
export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method Not Allowed" });

  let body = {};
  try { body = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid JSON" }); }

  const { token, uid, email, customerId, session_id } = body;
  console.log("[TGK] ⇄ set-entitlements start:", { uid, email, session_id });

  try {
    /* ------------------------------------------------------
       1. Verify / resolve UID + claims
    ------------------------------------------------------ */
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

    /* ------------------------------------------------------
       2. Pull current Firestore entitlement
    ------------------------------------------------------ */
    const entRef = firestore.collection("entitlements").doc(firebaseUid);
    const entSnap = await entRef.get();
    let current = entSnap.exists ? entSnap.data() : {};
    let existingTier = current.tier || "free";
    let existingRole = current.role || existingTier;

    /* ------------------------------------------------------
       3. 🔸 Admin override  (always honoured)
    ------------------------------------------------------ */
    if (email === "the.keymaker@thegnostickey.com") {
      await auth.setCustomUserClaims(firebaseUid, { tier: "admin", role: "admin" });
      await entRef.set(
        { tier: "admin", role: "admin", email, lastUpdated: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      console.log("[TGK] 🔱 Admin override applied");
      return json(200, { tier: "admin", role: "admin", override: true });
    }

    /* ------------------------------------------------------
       4. Resolve Stripe customer & active subscription
    ------------------------------------------------------ */
    let stripeCustomerId = customerId || current.stripeCustomerId || null;
    if (session_id && !stripeCustomerId) {
      try {
        const checkout = await stripe.checkout.sessions.retrieve(session_id);
        stripeCustomerId = checkout.customer;
      } catch (e) { console.warn("[TGK] Bad session_id:", e.message); }
    }
    if (!stripeCustomerId) return json(404, { error: "Stripe customer not found" });

    let stripeTier = "free";
    try {
      const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: "active", limit: 1 });
      const priceId = subs.data?.[0]?.items?.data?.[0]?.price?.id;
      if (INITIATE_IDS.includes(priceId)) stripeTier = "initiate";
      if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) stripeTier = "adept";
    } catch (e) { console.warn("[TGK] Stripe lookup failed:", e.message); }

    /* ------------------------------------------------------
       5. Decide final tier / role (priority: Stripe > Firestore > Claims)
    ------------------------------------------------------ */
    let finalTier = stripeTier !== "free" ? stripeTier : existingTier;
    let finalRole = existingRole || finalTier;

    if (claims.tier && claims.tier !== finalTier) finalTier = claims.tier;
    if (claims.role && claims.role !== finalRole) finalRole = claims.role;

    /* ------------------------------------------------------
       6. Update Firestore if anything changed
    ------------------------------------------------------ */
    const newData = {
      tier: finalTier,
      role: finalRole,
      stripeCustomerId,
      email: email || current.email || null,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
    await entRef.set(newData, { merge: true });

    /* ------------------------------------------------------
       7. Sync Firebase custom claims (always fresh)
    ------------------------------------------------------ */
    await auth.setCustomUserClaims(firebaseUid, { tier: finalTier, role: finalRole });
    console.log(`[TGK] Claims synced → ${finalTier}/${finalRole}`);

    /* ------------------------------------------------------
       8. Return unified result
    ------------------------------------------------------ */
    return json(200, {
      success: true,
      uid: firebaseUid,
      tier: finalTier,
      role: finalRole,
      stripeCustomerId,
      refreshed: true,
    });

  } catch (err) {
    console.error("[TGK] set-entitlements fatal:", err);
    return json(500, { error: err.message });
  }
};

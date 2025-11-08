// TGK — Netlify Function: Set Entitlements (Atomic + Claims Sync + Read-First)
// v4.5 — Claims Sync FIXED (2025-11-07)

import admin from "firebase-admin";
import Stripe from "stripe";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase credentials");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const firestore = admin.firestore();
const auth = admin.auth(); // ← CRITICAL
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const parseList = (s) => (s || "").split(",").map((v) => v.trim()).filter(Boolean);
const INITIATE_IDS = parseList(process.env.PRICE_INITIATE_IDS);
const FULL_IDS = parseList(process.env.PRICE_FULL_IDS);
const FULL_LIFEIDS = parseList(process.env.PRICE_FULL_LIFETIME_IDS);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return json(400, { error: "Invalid JSON" });
  }

  const { session_id, token, email, customerId, uid } = body;

  console.log("[TGK] set-entitlements payload:", { uid, customerId, email, token, session_id });

  if (!token && !session_id && !customerId) {
    console.log("[TGK] No token or new data — skipping (idempotent)");
    return json(200, { success: true, tier: "free", message: "No update needed" });
  }

  if (!uid && !token && !session_id && !customerId && !email) {
    console.warn("[TGK] Missing all identifiers");
    return json(400, { error: "Missing identifiers" });
  }

  try {
    let firebaseUid = uid || null;
    let claims = {};

    if (!firebaseUid && token) {
      try {
        const decoded = await auth.verifyIdToken(token);
        firebaseUid = decoded.uid;
        claims = decoded;
        console.log(`[TGK] UID + claims verified: ${firebaseUid}`);
      } catch (err) {
        console.warn("[TGK] Invalid Firebase token:", err.message);
      }
    }

    if (!firebaseUid) {
      console.warn("[TGK] Missing Firebase UID");
      return json(400, { error: "Missing Firebase UID" });
    }

    const entRef = firestore.collection("entitlements").doc(firebaseUid);
    const entSnap = await entRef.get();

    let existingTier = entSnap.exists ? entSnap.data().tier || "free" : "free";
    let existingRole = entSnap.exists ? entSnap.data().role || "user" : "user";

    let stripeCustomerId = customerId || null;

    if (session_id && !stripeCustomerId) {
      try {
        const checkout = await stripe.checkout.sessions.retrieve(session_id);
        stripeCustomerId = checkout.customer;
        console.log(`[TGK] Resolved customer from session: ${stripeCustomerId}`);
      } catch (err) {
        console.warn("[TGK] Invalid session_id:", err.message);
      }
    }

    if (!stripeCustomerId) {
      stripeCustomerId = entSnap.exists ? entSnap.data().stripeCustomerId : null;
      if (stripeCustomerId) console.log(`[TGK] Using existing customer: ${stripeCustomerId}`);
    }

    if (!stripeCustomerId) {
      console.warn("[TGK] No Stripe customer found");
      return json(404, { error: "Stripe customer not found" });
    }

    let newStripeTier = "free";
    try {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });

      const priceId = subs.data?.[0]?.items?.data?.[0]?.price?.id;
      if (INITIATE_IDS.includes(priceId)) newStripeTier = "initiate";
      if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) newStripeTier = "adept";

      console.log(`[TGK] Stripe tier: ${newStripeTier} (vs existing: ${existingTier})`);
    } catch (err) {
      console.warn("[TGK] Subscription lookup failed:", err.message);
    }

    let finalTier = existingTier;

    if (claims.tier && ["admin", "adept", "initiate", "free"].includes(claims.tier)) {
      if (claims.tier !== existingTier) {
        finalTier = claims.tier;
        console.log(`[TGK] Claims override: ${claims.tier} > ${existingTier}`);
      }
    }

    if (newStripeTier !== "free" && newStripeTier !== existingTier && newStripeTier !== claims.tier) {
      finalTier = newStripeTier;
      console.log(`[TGK] Stripe upgrade: ${newStripeTier} > ${existingTier}`);
    }

    let resolvedEmail = email || null;
    let existingEmail = entSnap.exists ? entSnap.data().email : null;

    if (!resolvedEmail) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if (!customer.deleted && "email" in customer && typeof customer.email === "string") {
          resolvedEmail = customer.email;
          if (resolvedEmail !== existingEmail) console.log(`[TGK] Email updated: ${resolvedEmail}`);
        }
      } catch (err) {
        console.warn("[TGK] Could not fetch email from Stripe:", err.message);
      }
    }

    if (resolvedEmail && resolvedEmail !== existingEmail) {
      const allEnts = await firestore
        .collection("entitlements")
        .where("email", "==", resolvedEmail)
        .get();

      if (allEnts.size > 1) {
        console.warn(`[TGK] Cleaning ${allEnts.size - 1} duplicate(s) for ${resolvedEmail}`);
        const batch = firestore.batch();
        allEnts.forEach((doc) => {
          if (doc.id !== firebaseUid) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
      }
    }

    const payload = {};

    if (finalTier !== existingTier) payload.tier = finalTier;
    if (resolvedEmail && resolvedEmail !== existingEmail) payload.email = resolvedEmail;
    if (claims.role && claims.role !== existingRole) payload.role = claims.role;
    payload.lastUpdated = admin.firestore.FieldValue.serverTimestamp();

    let dbUpdated = false;
    let claimsSynced = false;

    if (Object.keys(payload).length > 1) {
      await entRef.set(payload, { merge: true });
      dbUpdated = true;
      console.log(`[TGK] Updated entitlement: ${finalTier} (${claims.role || existingRole})`);
    } else {
      console.log("[TGK] No changes — entitlement unchanged");
    }

    // ──────── SYNC FIREBASE AUTH CLAIMS (ONLY IF NEEDED) ────────
    const currentClaims = claims || {};
    const targetClaims = {};

    if (finalTier !== currentClaims.tier) {
      targetClaims.tier = finalTier;
      console.log(`[TGK] Setting claim tier: ${finalTier}`);
    }

    if (claims.role && claims.role !== currentClaims.role) {
      targetClaims.role = claims.role;
      console.log(`[TGK] Setting claim role: ${claims.role}`);
    }

    if (Object.keys(targetClaims).length > 0) {
      await auth.setCustomUserClaims(firebaseUid, {
        ...currentClaims,
        ...targetClaims
      });
      claimsSynced = true;
      console.log(`[TGK] Firebase Auth claims updated:`, targetClaims);
    } else {
      console.log("[TGK] No claim changes needed");
    }

    return json(200, {
      success: true,
      tier: finalTier,
      role: claims.role || existingRole,
      customerId: stripeCustomerId,
      uid: firebaseUid,
      updated: dbUpdated,
      claimsSynced,
    });

  } catch (err) {
    console.error("[TGK] set-entitlements error:", err);
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
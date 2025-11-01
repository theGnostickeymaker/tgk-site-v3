// TGK — Netlify Function: Set Entitlements (Atomic + Duplicate Cleanup)
// v4.0 — Basil Atomic Cleanup (2025-11-01)
// Handles: UID fallback, Stripe sync, tier mapping, duplicate merge/delete

import admin from "firebase-admin";
import Stripe from "stripe";

// Secure Firebase Admin Init
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

  // ADD THIS LINE HERE
  console.log("[TGK] set-entitlements payload:", { uid, customerId, email, token, session_id });

  // EARLY VALIDATION
  if (!uid && !token && !session_id && !customerId && !email) {
    console.warn("[TGK] Missing all identifiers");
    return json(400, { error: "Missing identifiers (uid, token, session_id, customerId, or email required)" });
  }

  try {
    /* ───────────────────────────────────────────────
       Resolve Firebase UID
       ─────────────────────────────────────────────── */
    let firebaseUid = uid || null;

    if (!firebaseUid && token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        firebaseUid = decoded.uid;
        console.log(`[TGK] UID verified from token: ${firebaseUid}`);
      } catch (err) {
        console.warn("[TGK] Invalid Firebase token:", err.message);
      }
    }

    if (!firebaseUid) {
      console.warn("[TGK] Missing Firebase UID");
      return json(400, { error: "Missing Firebase UID" });
    }

    /* ───────────────────────────────────────────────
       Resolve Stripe Customer ID
       ─────────────────────────────────────────────── */
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
      const existing = await firestore.collection("entitlements").doc(firebaseUid).get();
      if (existing.exists && existing.data().stripeCustomerId) {
        stripeCustomerId = existing.data().stripeCustomerId;
        console.log(`[TGK] Using existing customer: ${stripeCustomerId}`);
      }
    }

    if (!stripeCustomerId) {
      console.warn("[TGK] No Stripe customer found");
      return json(404, { error: "Stripe customer not found" });
    }

    /* ───────────────────────────────────────────────
       Determine Active Tier
       ─────────────────────────────────────────────── */
    let tier = "free";
    try {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });

      const priceId = subs.data?.[0]?.items?.data?.[0]?.price?.id;
      if (INITIATE_IDS.includes(priceId)) tier = "initiate";
      if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";

      console.log(`[TGK] Active tier: ${tier} (price: ${priceId || "none"})`);
    } catch (err) {
      console.warn("[TGK] Subscription lookup failed:", err.message);
    }

   /* ───────────────────────────────────────────────
       Resolve Email (fallback to Stripe if missing)
       ─────────────────────────────────────────────── */
    let resolvedEmail = email || null;

    if (!resolvedEmail) {
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);

        // TYPE-GUARD: only a non-deleted customer has the `email` field
        if (!customer.deleted && "email" in customer && typeof customer.email === "string") {
          resolvedEmail = customer.email;
          console.log(`[TGK] Email resolved from Stripe: ${resolvedEmail}`);
        } else {
          console.warn("[TGK] Stripe customer has no email (deleted or missing)");
        }
      } catch (err) {
        console.warn("[TGK] Could not fetch email from Stripe:", err.message);
      }
    }

    /* ───────────────────────────────────────────────
       DUPLICATE CLEANUP: Delete other UIDs with same email
       ─────────────────────────────────────────────── */
    if (resolvedEmail) {
      const allEnts = await firestore
        .collection("entitlements")
        .where("email", "==", resolvedEmail)
        .get();

      if (allEnts.size > 1) {
        console.warn(`[TGK] Multiple entitlements for ${resolvedEmail} — cleaning up`);
        const batch = firestore.batch();
        let deleted = 0;

        allEnts.forEach((doc) => {
          if (doc.id !== firebaseUid) {
            batch.delete(doc.ref);
            deleted++;
          }
        });

        await batch.commit();
        console.log(`[TGK] Deleted ${deleted} duplicate entitlement(s)`);
      }
    }

    /* ───────────────────────────────────────────────
       Write Final Entitlement
       ─────────────────────────────────────────────── */
    const payload = {
      uid: firebaseUid,
      email: resolvedEmail,
      stripeCustomerId,
      tier,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection("entitlements").doc(firebaseUid).set(payload, { merge: true });

    console.log(`[TGK] Entitlement set → ${resolvedEmail || firebaseUid} :: ${tier}`);
    return json(200, {
      success: true,
      tier,
      customerId: stripeCustomerId,
      uid: firebaseUid,
    });

  } catch (err) {
    console.error("[TGK] set-entitlements error:", err);
    return json(500, { error: err.message });
  }
};

/* ===========================================================
   JSON Helper
   =========================================================== */
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}


// 🜂 TGK — Deprecated Function Notice
// File: sync-custom-claims.js (deprecated after 2025.10.27 build)
// Purpose: Retained only for potential Firebase Admin role syncs.

import admin from "firebase-admin";
import Stripe from "stripe";

// 🜂 Secure Admin Bootstrap (dual-key tolerant)
if (!admin.apps.length) {
  let raw = process.env.FIREBASE_ADMIN_KEY_B64 || process.env.FIREBASE_ADMIN_KEY;
  if (raw && !raw.trim().startsWith("{"))
    raw = Buffer.from(raw, "base64").toString("utf8");
  const credentials = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

// 🜂 Main Handler
export const handler = async () => {
  return json(410, {
    deprecated: true,
    message: "Deprecated function — retained for legacy Firebase role syncs.",
    retired: "2025-10-27",
  });
};

// 🜂 JSON Helper
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// Deprecated: no longer used after 2025.10.27 build.
// Retained for potential Firebase Admin role syncs.

import admin from "firebase-admin";
import Stripe from "stripe";

if (!admin.apps.length) {
  let raw = process.env.FIREBASE_ADMIN_KEY_B64 || process.env.FIREBASE_ADMIN_KEY;
  if (raw && !raw.trim().startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");
  const credentials = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
}

const firestore = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  return { statusCode: 410, body: JSON.stringify({ message: "Deprecated function" }) };
};

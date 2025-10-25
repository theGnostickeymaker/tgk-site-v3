/* ===========================================================
   🜂 TGK — Netlify Function: Create Stripe Customer
   Links new Firebase user to a Stripe customer and sets tier.
   =========================================================== */

import Stripe from "stripe";
import admin from "firebase-admin";

// 🜂 Ensure admin SDK initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY))
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { email, token, tier } = JSON.parse(event.body || "{}");
    if (!email) return { statusCode: 400, body: "Missing email" };

    // 🜂 Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 🜂 Skip Stripe for Free users
    if (!tier || tier === "free") {
      console.log(`[TGK] Free tier detected for ${email}`);
      await admin.firestore().collection("entitlements").doc(uid).set({
        uid,
        email,
        tier: "free",
        created: admin.firestore.FieldValue.serverTimestamp()
      });
      return { statusCode: 200, body: JSON.stringify({ message: "Free user registered" }) };
    }

    // 🜂 Create Stripe Customer for paying tiers
    const customer = await stripe.customers.create({
      email,
      metadata: { firebaseUID: uid, tier: tier || "initiate" }
    });

    // 🜂 Store in Firestore
    await admin.firestore().collection("entitlements").doc(uid).set({
      uid,
      email,
      tier: tier || "initiate",
      stripeCustomerId: customer.id,
      created: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[TGK] Stripe customer created for ${email}`);
    return { statusCode: 200, body: JSON.stringify({ customerId: customer.id }) };
  } catch (err) {
    console.error("[TGK] Error creating Stripe customer:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

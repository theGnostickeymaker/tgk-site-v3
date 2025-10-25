// 🜂 TGK — Netlify Function: Create Stripe Customer
// Creates a Stripe customer for every Firebase user signup
// and links them to Firestore entitlements.

import Stripe from "stripe";
import admin from "firebase-admin";

// 🜂 Firebase Admin Init (3-var secure method)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase credentials in environment");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const firestore = admin.firestore();

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return json(405, { error: "Method Not Allowed" });

    const { email, token } = JSON.parse(event.body || "{}");
    if (!email || !token)
      return json(400, { error: "Missing email or token" });

    // 🔹 Verify Firebase token → get UID
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // 🔹 Check if entitlement already exists
    const entRef = firestore.collection("entitlements").doc(uid);
    const entSnap = await entRef.get();
    if (entSnap.exists) {
      console.log(`[TGK] 🔄 Customer already exists for ${email}`);
      return json(200, { message: "Customer already exists" });
    }

    // 🔹 Create or fetch Stripe customer
    let customer;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customer = existing.data[0];
      console.log(`[TGK] ♻️ Existing Stripe customer found: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { firebaseUID: uid, tier: "free" },
      });
      console.log(`[TGK] 🆕 Stripe customer created: ${customer.id}`);
    }

    // 🔹 Write entitlement record
    const entitlement = {
      uid,
      email,
      stripeCustomerId: customer.id,
      tier: "free",
      created: admin.firestore.FieldValue.serverTimestamp(),
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
    };

    await entRef.set(entitlement, { merge: true });

    console.log(`[TGK] ✅ Firestore entitlement created for ${email}`);
    return json(200, { message: "Customer created", customerId: customer.id });
  } catch (err) {
    console.error("[TGK] ❌ create-stripe-customer error:", err);
    return json(500, { error: err.message });
  }
};

// 🜂 JSON Helper
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

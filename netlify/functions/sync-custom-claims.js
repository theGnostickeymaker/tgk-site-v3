// 🜂 TGK — Sync Custom Claims (Tier + Role Propagation)
// Ensures Firebase Auth token reflects entitlements tier for access gates

import admin from "firebase-admin";

// === 🜂 Initialise Firebase Admin (safe, once) ===
if (!admin.apps.length) {
  let raw = process.env.FIREBASE_ADMIN_KEY_B64 || process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("FIREBASE_ADMIN_KEY missing");

  if (!raw.trim().startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");
  const creds = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(creds)
  });
}

const firestore = admin.firestore();

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST")
      return json(405, { error: "Method Not Allowed" });

    const { uid, email } = JSON.parse(event.body || "{}");
    if (!uid && !email) return json(400, { error: "Missing uid or email" });

    // 🔹 Resolve userId via email if needed
    let userId = uid;
    if (!userId && email) {
      const userRec = await admin.auth().getUserByEmail(email);
      userId = userRec.uid;
    }

    // 🔹 Look up entitlement
    let tier = "free";
    const entRef = firestore.collection("entitlements").doc(userId);
    const snap = await entRef.get();
    if (snap.exists) {
      tier = snap.data()?.tier || "free";
    }

    // 🔹 Determine role for claim propagation
    let role = "user";
    if (tier === "initiate") role = "partial";
    if (tier === "adept") role = "full";
    if (tier === "admin") role = "admin";

    // 🔹 Apply claims
    await admin.auth().setCustomUserClaims(userId, { tier, role });

    console.log(`[TGK] ✅ Custom claims set for ${email || userId}: tier=${tier}, role=${role}`);
    return json(200, { success: true, tier, role });
  } catch (err) {
    console.error("[TGK] ❌ sync-custom-claims error:", err);
    return json(500, { error: err.message });
  }
};

// 🜂 Helper
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

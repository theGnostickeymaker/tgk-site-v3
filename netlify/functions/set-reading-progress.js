// ==========================================================
// 🜂 TGK — Netlify Function: Save Reading Progress
// Version: 1.0 (2025-12-05)
// Writes the user's last visited meaningful page to Firestore
// ==========================================================

import admin from "firebase-admin";

/* ----------------------------------------------------------
   Initialise Firebase Admin
---------------------------------------------------------- */
if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const firestore = admin.firestore();

/* ----------------------------------------------------------
   Helper: JSON Response
---------------------------------------------------------- */
function json(status, body) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/* ----------------------------------------------------------
   Main Handler
---------------------------------------------------------- */
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const { uid, url, userAgent } = body;

  // Basic validation
  if (!uid || !url) {
    return json(400, { error: "Missing uid or url" });
  }

  try {
    // Write to Firestore under: userProgress/{uid}/latest
    const docRef = firestore
      .collection("userProgress")
      .doc(uid);

    await docRef.set(
      {
        lastPage: url,
        userAgent: userAgent || "unknown",
        updated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`[Progress] Updated: ${uid} → ${url}`);

    return json(200, { success: true, lastPage: url });

  } catch (err) {
    console.error("[Progress] Error:", err);
    return json(500, { error: err.message });
  }
}

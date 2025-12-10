// netlify/functions/rep-award.mjs
import admin from "firebase-admin";

let appInitialised = false;

function initFirebaseAdmin() {
  if (appInitialised) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    console.error("[rep-award] Missing FIREBASE_SERVICE_ACCOUNT");
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: serviceAccount.project_id,
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key.replace(/\\n/g, "\n")
    })
  });

  appInitialised = true;
  console.log("[rep-award] Firebase Admin initialised");
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method not allowed" };
    }

    initFirebaseAdmin();

    const token = event.headers["x-firebase-token"];
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: "Missing Firebase ID token" }) };
    }

    // Verify caller (voter)
    const decoded = await admin.auth().verifyIdToken(token);
    const voterUid = decoded.uid;

    // Parse body
    const { toUserId, points, type = "award", details = "", topicId = null } =
      JSON.parse(event.body || "{}");

    if (!toUserId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing toUserId" }) };
    }
    if (typeof points !== "number") {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid points value" }) };
    }

    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    const repDocRef = db.collection("reputation").doc(toUserId);
    const eventRef = repDocRef.collection("events").doc();

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(repDocRef);
      const current = snap.exists ? snap.data().total || 0 : 0;

      tx.set(repDocRef, {
        total: current + points,
        updatedAt: now
      }, { merge: true });

      tx.set(eventRef, {
        fromUserId: voterUid,
        toUserId,
        points,
        type,
        details,
        topicId,
        createdAt: now
      });
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error("[rep-award] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "rep-award failed", detail: String(err) })
    };
  }
};

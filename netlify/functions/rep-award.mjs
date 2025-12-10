// netlify/functions/rep-award.mjs
import admin from "firebase-admin";

let appInitialised = false;

function initFirebaseAdmin() {
  if (appInitialised) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    console.error("[rep-award] Missing FIREBASE_SERVICE_ACCOUNT env var");
    throw new Error("Service account config missing");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });

  appInitialised = true;
}

export const handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    initFirebaseAdmin();

    const authHeader = event.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Missing Firebase ID token" })
      };
    }

    // Verify the caller is a real TGK user
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { amount, type, reason, topicId } = JSON.parse(event.body || "{}");

    if (!amount || typeof amount !== "number") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or missing amount" })
      };
    }

    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    const repDocRef = db.collection("reputation").doc(uid);
    const eventsColRef = repDocRef.collection("events");

    // Build a new event record
    const eventRef = eventsColRef.doc();
    const eventPayload = {
      amount,
      type: type || "generic",
      reason: reason || "",
      topicId: topicId || null,
      createdAt: now
    };

    // Use a transaction for consistency
    await db.runTransaction(async (tx) => {
      const repSnap = await tx.get(repDocRef);
      const currentTotal = repSnap.exists ? (repSnap.data().total || 0) : 0;
      const newTotal = currentTotal + amount;

      tx.set(repDocRef, { total: newTotal, updatedAt: now }, { merge: true });
      tx.set(eventRef, eventPayload);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error("[rep-award] Error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "rep-award failed",
        detail: String(err)
      })
    };
  }
};

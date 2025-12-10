// netlify/functions/rep-award.mjs
import admin from "firebase-admin";

let appInitialised = false;

/* ============================================================
   Initialise Firebase Admin using split environment variables
============================================================ */
function initFirebaseAdmin() {
  if (appInitialised) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[rep-award] Missing Firebase Admin environment variables");
    throw new Error("Missing Firebase Admin configuration");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n")
    })
  });

  appInitialised = true;
  console.log("[rep-award] Firebase Admin initialised");
}

/* ============================================================
   Handler
============================================================ */
export const handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    initFirebaseAdmin();

    // --------------------------------------------------------
    // Extract Firebase ID token (supports all header forms)
    // --------------------------------------------------------
    const headers = event.headers || {};

    let token =
      headers.authorization ||
      headers.Authorization ||
      headers["x-firebase-token"] ||
      headers["X-Firebase-Token"] ||
      null;

    if (token && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    if (!token) {
      console.error("[rep-award] Missing Firebase ID token");
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Missing Firebase ID token" })
      };
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.error("[rep-award] Token verification error:", err);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Firebase ID token" })
      };
    }

    // --------------------------------------------------------
    // Parse payload
    // --------------------------------------------------------
    const body = JSON.parse(event.body || "{}");

    const toUserId = body.toUserId;
    const amount = body.points ?? body.amount;
    const type = body.type || "generic";
    const reason = body.details || body.reason || "";
    const topicId = body.topicId || null;

    if (!toUserId) {
      console.error("[rep-award] Missing toUserId");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing target user" })
      };
    }

    if (typeof amount !== "number" || isNaN(amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or missing points/amount" })
      };
    }

    // --------------------------------------------------------
    // Firestore references
    // --------------------------------------------------------
    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    const repDocRef = db.collection("reputation").doc(toUserId);
    const eventsRef = repDocRef.collection("events").doc();

    // --------------------------------------------------------
    // FULL reputation schema (self-healing)
    // --------------------------------------------------------
    const DEFAULT_SCHEMA = {
      total: 0,
      tier: "initiate",
      repliesPosted: 0,
      steelemanAccepted: 0,
      strikes: 0,
      threadsCreated: 0,
      lastUpdated: now,
      updatedAt: now
    };

    const eventPayload = {
      amount,
      type,
      reason,
      topicId,
      createdAt: now
    };

    console.log("[SERVER] FINAL DELTA RECEIVED:", amount);


    // --------------------------------------------------------
    // Transaction: create/heal reputation doc + add event
    // --------------------------------------------------------
    await db.runTransaction(async (tx) => {
      const repSnap = await tx.get(repDocRef);

      const base = repSnap.exists ? repSnap.data() : {};
      const merged = { ...DEFAULT_SCHEMA, ...base };

      merged.total = (merged.total || 0) + amount;
      merged.updatedAt = now;

      tx.set(repDocRef, merged, { merge: true });
      tx.set(eventsRef, eventPayload);
    });

    console.log(
      `[rep-award] +${amount} Keys → UID ${toUserId} (${type}) reason="${reason}"`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error("[rep-award] ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "rep-award failed",
        detail: String(err)
      })
    };
  }
};

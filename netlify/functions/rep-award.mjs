// netlify/functions/rep-award.mjs
import admin from "firebase-admin";

let appInitialised = false;

/* ============================================================
   Initialise Firebase Admin using split environment variables
   (avoids the AWS Lambda 4KB environment size limit)
============================================================ */
function initFirebaseAdmin() {
  if (appInitialised) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("[rep-award] Missing Firebase Admin environment variables", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey
    });
    throw new Error("Missing Firebase Admin configuration variables");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n") // fix escaped newlines
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

    /* ------------------------------------------------------------
       Robust token extraction — supports all header formats,
       handles Netlify lowercasing, and accepts both:
         - Authorization: Bearer <token>
         - X-Firebase-Token: <token>
    ------------------------------------------------------------ */
    const headers = event.headers || {};

    let token =
      headers.authorization ||
      headers.Authorization ||
      headers["x-firebase-token"] ||
      headers["X-Firebase-Token"] ||
      null;

    // If using "Bearer <token>"
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

    // Verify token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.error("[rep-award] Token verification failed", err);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Firebase token" })
      };
    }

    const uid = decoded.uid;

    /* ------------------------------------------------------------
       Parse payload
    ------------------------------------------------------------ */
    const body = JSON.parse(event.body || "{}");
    const amount = body.amount ?? body.points; // accept either name
    const type = body.type || "generic";
    const reason = body.reason || body.details || "";
    const topicId = body.topicId || null;

    if (typeof amount !== "number" || isNaN(amount)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or missing amount" })
      };
    }

    /* ------------------------------------------------------------
       Perform Firestore writes
    ------------------------------------------------------------ */
    const db = admin.firestore();
    const now = admin.firestore.FieldValue.serverTimestamp();

    const repDocRef = db.collection("reputation").doc(uid);
    const eventsRef = repDocRef.collection("events").doc();

    const eventPayload = {
      amount,
      type,
      reason,
      topicId,
      createdAt: now
    };

    await db.runTransaction(async (tx) => {
      const repSnap = await tx.get(repDocRef);
      const currentTotal =
        repSnap.exists ? repSnap.data().total || 0 : 0;

      const newTotal = currentTotal + amount;

      tx.set(
        repDocRef,
        {
          total: newTotal,
          updatedAt: now
        },
        { merge: true }
      );

      tx.set(eventsRef, eventPayload);
    });

    console.log(
      `[rep-award] +${amount} Keys → UID ${uid} (${type}) reason="${reason}"`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error("[rep-award] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "rep-award failed",
        detail: String(err)
      })
    };
  }
};

const admin = require("firebase-admin");

if (!admin.apps.length) {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("Firebase admin env vars missing");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const {
      courtLogId,
      verdict,
      jurySummary,
      counts,
    } = JSON.parse(event.body || "{}");

    if (
      !courtLogId ||
      !verdict ||
      !jurySummary ||
      !counts ||
      typeof counts.for !== "number" ||
      typeof counts.against !== "number"
    ) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const logRef = db.collection("courtLogs").doc(courtLogId);
    const logSnap = await logRef.get();

    if (!logSnap.exists) {
      return { statusCode: 404, body: "Court log not found" };
    }

    if (logSnap.data().status === "Closed") {
      return { statusCode: 409, body: "Court log already closed" };
    }

    const now = admin.firestore.Timestamp.now();

    await db.runTransaction(async (tx) => {
      tx.update(logRef, {
        status: "Closed",
        verdict,
        jurySummary,
        juryCounts: counts,
        closedAt: now,
      });

      const entryRef = logRef
        .collection("entries")
        .doc(`entry-${Date.now()}`);

      tx.create(entryRef, {
        type: "ruling",
        body: `Verdict: ${verdict}\n\n${jurySummary}`,
        sequence: 999,
        createdBy: "system",
        createdAt: now,
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error("Publish failed:", err);
    return { statusCode: 500, body: "Internal error" };
  }
};

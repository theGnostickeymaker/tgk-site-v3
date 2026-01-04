const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { caseId } = JSON.parse(event.body || "{}");
    if (!caseId) {
      return { statusCode: 400, body: "Missing caseId" };
    }

    const caseRef = db.collection("juryCases").doc(caseId);
    const caseSnap = await caseRef.get();

    if (!caseSnap.exists) {
      return { statusCode: 404, body: "Jury case not found" };
    }

    const caseData = caseSnap.data();

    if (caseData.status !== "verdict") {
      return {
        statusCode: 409,
        body: "Case not ready for publication",
      };
    }

    if (caseData.publishedCourtLogId) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "already_published",
          courtLogId: caseData.publishedCourtLogId,
        }),
      };
    }

    const now = admin.firestore.Timestamp.now();
    const courtLogRef = db.collection("courtLogs").doc();

    await db.runTransaction(async (tx) => {
      // Create court log
      tx.create(courtLogRef, {
        title: caseData.title,
        summary: caseData.jurySummary,
        status: "Closed",
        jurisdiction: "TGK Community Court",
        createdBy: "system",
        createdAt: now,
        publishedAt: now,
        tags: ["jury", "verdict"],
      });

      // Ruling entry
      const entryRef = courtLogRef
        .collection("entries")
        .doc("entry-001");

      tx.create(entryRef, {
        type: "ruling",
        body: `Verdict: ${caseData.verdict.toUpperCase()}\n\n${caseData.jurySummary}`,
        sequence: 1,
        createdBy: "system",
        createdAt: now,
      });

      // Seal jury case
      tx.update(caseRef, {
        status: "published",
        publishedCourtLogId: courtLogRef.id,
        publishedAt: now,
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "published",
        courtLogId: courtLogRef.id,
      }),
    };

  } catch (err) {
    console.error("Publish verdict error:", err);
    return {
      statusCode: 500,
      body: "Internal publication error",
    };
  }
};

import { apps, initializeApp, credential as _credential, firestore } from "firebase-admin";

if (!apps.length) {
  initializeApp({
    credential: _credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = firestore();

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const payload = JSON.parse(event.body || "{}");
    const { caseId, court, entries } = payload;

    if (!caseId || !court || !Array.isArray(entries) || entries.length === 0) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const caseRef = db.collection("juryCases").doc(caseId);
    const caseSnap = await caseRef.get();

    if (!caseSnap.exists) {
      return { statusCode: 404, body: "Jury case not found" };
    }

    const caseData = caseSnap.data();

    if (caseData.status === "published") {
      return { statusCode: 409, body: "Case already published" };
    }

    const now = firestore.Timestamp.now();
    const courtLogRef = db.collection("courtLogs").doc();

    await db.runTransaction(async (tx) => {
      tx.create(courtLogRef, {
        title: court.title,
        summary: court.summary,
        status: "Closed",
        jurisdiction: "TGK Community Court",
        createdBy: "system",
        createdAt: now,
        publishedAt: now,
        tags: court.tags,
      });

      entries.forEach((entry, index) => {
        const entryRef = courtLogRef
          .collection("entries")
          .doc(`entry-${String(index + 1).padStart(3, "0")}`);

        tx.create(entryRef, {
          type: entry.type,
          body: entry.body,
          sequence: index + 1,
          createdBy: "system",
          createdAt: now,
        });
      });

      tx.update(caseRef, {
        status: "published",
        publishedCourtLogId: courtLogRef.id,
        publishedAt: now,
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        courtLogId: courtLogRef.id,
      }),
    };

  } catch (err) {
    console.error("Publish failed:", err);
    return {
      statusCode: 500,
      body: "Internal error during publication",
    };
  }
}

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

const REQUIRED_JURORS = 9;
const THRESHOLD = 6;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
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

    if (caseData.status === "published") {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "already_published" })
      };
    }

    const votesSnap = await caseRef.collection("votes").get();

    const counts = { for: 0, against: 0, abstain: 0 };

    votesSnap.forEach(doc => {
      const v = doc.data().vote;
      if (counts[v] !== undefined) counts[v]++;
    });

    const totalVotes = votesSnap.size;

    // Not enough jurors yet
    if (totalVotes < REQUIRED_JURORS) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "pending",
          counts,
          totalVotes
        })
      };
    }

    let verdict = null;

    if (counts.for >= THRESHOLD) verdict = "sanction";
    if (counts.against >= THRESHOLD) verdict = "dismiss";

    if (!verdict) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "no_majority",
          counts
        })
      };
    }

    /* ===============================
       AUTO-PUBLISH TO COURT LOG
    =============================== */

    const now = admin.firestore.Timestamp.now();
    const courtLogRef = db.collection("courtLogs").doc();

    await db.runTransaction(async (tx) => {
      tx.create(courtLogRef, {
        title: caseData.title,
        summary: `Jury verdict: ${verdict}`,
        status: "Closed",
        jurisdiction: "TGK Community Court",
        createdBy: "system",
        createdAt: now,
        publishedAt: now,
        tags: ["jury", verdict]
      });

      tx.create(
        courtLogRef.collection("entries").doc("entry-001"),
        {
          type: "ruling",
          body:
            `Verdict: ${verdict}\n\n` +
            `Votes for: ${counts.for}\n` +
            `Votes against: ${counts.against}\n` +
            `Abstentions: ${counts.abstain}`,
          sequence: 1,
          createdBy: "system",
          createdAt: now
        }
      );

      tx.update(caseRef, {
        status: "published",
        publishedCourtLogId: courtLogRef.id,
        publishedAt: now
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "published",
        verdict,
        courtLogId: courtLogRef.id,
        counts
      })
    };

  } catch (err) {
    console.error("Threshold check failed:", err);
    return {
      statusCode: 500,
      body: "Internal threshold error"
    };
  }
};

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

    if (caseData.status !== "open") {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: caseData.status }),
      };
    }

    const votesSnap = await caseRef.collection("votes").get();

    let counts = { for: 0, against: 0, abstain: 0 };

    votesSnap.forEach(doc => {
      const v = doc.data().vote;
      if (counts[v] !== undefined) counts[v]++;
    });

    const totalVotes = counts.for + counts.against + counts.abstain;
    const nonAbstain = counts.for + counts.against;

    if (totalVotes < 7 || nonAbstain === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "pending",
          counts,
          totalVotes
        }),
      };
    }

    const required = Math.ceil((2 / 3) * nonAbstain);
    const verdict = counts.for >= required ? "sanction" : "dismissed";

    const now = admin.firestore.Timestamp.now();

    // 🔒 Lock the jury case
    await caseRef.update({
      status: "verdict",
      verdict,
      counts,
      jurySummary: `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`,
      decidedAt: now,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "verdict",
        verdict,
        counts,
        totalVotes,
      }),
    };

  } catch (err) {
    console.error("Threshold error:", err);
    return {
      statusCode: 500,
      body: "Internal adjudication error",
    };
  }
};

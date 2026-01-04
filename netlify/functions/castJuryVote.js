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

    const authHeader = event.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return { statusCode: 401, body: "Missing auth token" };
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    const { caseId, vote } = JSON.parse(event.body || "{}");
    if (!caseId || !["for", "against", "abstain"].includes(vote)) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const caseRef = db.collection("juryCases").doc(caseId);
    const voteRef = caseRef.collection("votes").doc(uid);

    await db.runTransaction(async (tx) => {
      const caseSnap = await tx.get(caseRef);
      if (!caseSnap.exists) throw new Error("Case not found");

      const caseData = caseSnap.data();
      if (caseData.status !== "open") {
        throw new Error("Case not open");
      }

      const jurorRef = caseRef.collection("jurors").doc(uid);
      const jurorSnap = await tx.get(jurorRef);
      if (!jurorSnap.exists) {
        throw new Error("Not an assigned juror");
      }

      const existingVote = await tx.get(voteRef);
      if (existingVote.exists) {
        throw new Error("Vote already cast");
      }

      tx.create(voteRef, {
        vote,
        castAt: admin.firestore.Timestamp.now(),
      });
    });

    // ---- Re-count votes AFTER transaction ----
    const votesSnap = await caseRef.collection("votes").get();
    const counts = { for: 0, against: 0, abstain: 0 };

    votesSnap.forEach(doc => {
      const v = doc.data().vote;
      if (counts[v] !== undefined) counts[v]++;
    });

    const totalVotes = counts.for + counts.against + counts.abstain;
    const nonAbstain = counts.for + counts.against;

    // ---- Threshold rules ----
    const MIN_VOTES = 7;
    if (totalVotes < MIN_VOTES || nonAbstain === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          result: {
            status: "pending",
            counts,
            totalVotes,
            nonAbstain
          }
        })
      };
    }

    const required = Math.ceil((2 / 3) * nonAbstain);
    const verdict = counts.for >= required ? "sanction" : "dismissed";
    const now = admin.firestore.Timestamp.now();

    // ---- Auto-publication ----
    const courtLogRef = db.collection("courtLogs").doc();

    await db.runTransaction(async (tx) => {
      const freshCase = await tx.get(caseRef);
      if (freshCase.data().status !== "open") return;

      tx.update(caseRef, {
        status: "published",
        verdict,
        counts,
        decidedAt: now,
        publishedCourtLogId: courtLogRef.id
      });

      tx.create(courtLogRef, {
        title: freshCase.data().title || "Community Court Ruling",
        summary: freshCase.data().summary || "",
        status: "Closed",
        jurisdiction: "TGK Community Court",
        createdBy: "system",
        createdAt: now,
        publishedAt: now,
        tags: ["jury", verdict]
      });

      tx.create(
        courtLogRef.collection("entries").doc("verdict"),
        {
          type: "ruling",
          body: `Verdict: ${verdict}. Jury vote: ${counts.for} for, ${counts.against} against, ${counts.abstain} abstained.`,
          sequence: 1,
          createdBy: "system",
          createdAt: now
        }
      );
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result: {
          status: "published",
          verdict,
          counts,
          totalVotes,
          nonAbstain
        }
      })
    };

  } catch (err) {
    console.error("Vote error:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: err.message
      })
    };
  }
};

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
    // -------------------------------------------
    // Method guard
    // -------------------------------------------
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // -------------------------------------------
    // Auth
    // -------------------------------------------
    const authHeader = event.headers.authorization || event.headers.Authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return { statusCode: 401, body: "Missing auth token" };
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // -------------------------------------------
    // Payload
    // -------------------------------------------
    const { caseId, vote } = JSON.parse(event.body || "{}");
    if (!caseId || !["for", "against", "abstain"].includes(vote)) {
      return { statusCode: 400, body: "Invalid payload" };
    }

    const caseRef = db.collection("juryCases").doc(caseId);
    const voteRef = caseRef.collection("votes").doc(uid);

    // -------------------------------------------
    // Cast vote transaction (single-cast, immutable)
    // -------------------------------------------
    await db.runTransaction(async (tx) => {
      const caseSnap = await tx.get(caseRef);
      if (!caseSnap.exists) throw new Error("Case not found");

      const caseData = caseSnap.data();
      if (caseData.status !== "open") throw new Error("Case not open");

      const jurorRef = caseRef.collection("jurors").doc(uid);
      const jurorSnap = await tx.get(jurorRef);
      if (!jurorSnap.exists) throw new Error("Not an assigned juror");

      const existingVote = await tx.get(voteRef);
      if (existingVote.exists) throw new Error("Vote already cast");

      tx.create(voteRef, {
        vote,
        castAt: admin.firestore.Timestamp.now(),
      });
    });

    // -------------------------------------------
    // Recount votes
    // -------------------------------------------
    const [caseSnap, votesSnap, jurorsSnap] = await Promise.all([
      caseRef.get(),
      caseRef.collection("votes").get(),
      caseRef.collection("jurors").get(),
    ]);

    const caseData = caseSnap.data();

    const counts = { for: 0, against: 0, abstain: 0 };
    votesSnap.forEach((doc) => {
      const v = doc.data().vote;
      if (counts[v] !== undefined) counts[v]++;
    });

    const totalVotes = counts.for + counts.against + counts.abstain;
    const nonAbstain = counts.for + counts.against;

    // -------------------------------------------
    // Required votes (data-driven)
    // -------------------------------------------
    const configuredRequired =
      typeof caseData.requiredVotes === "number" ? caseData.requiredVotes : 3;

    const jurorCount = jurorsSnap.size;
    const effectiveMinVotes = Math.min(configuredRequired, jurorCount);

    // Not enough votes yet
    if (totalVotes < effectiveMinVotes || nonAbstain === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          result: {
            status: "pending",
            counts,
            totalVotes,
            nonAbstain,
            requiredVotes: effectiveMinVotes,
          },
        }),
      };
    }

    // -------------------------------------------
    // Threshold logic (data-driven)
    // -------------------------------------------
    let verdict;
    const threshold = (caseData.threshold || "majority").toLowerCase();

    if (threshold === "supermajority") {
      const required = Math.ceil((2 / 3) * nonAbstain);
      verdict = counts.for >= required ? "sanction" : "dismissed";
    } else {
      // majority
      verdict = counts.for > counts.against ? "sanction" : "dismissed";
    }

    const now = admin.firestore.Timestamp.now();

    // -------------------------------------------
    // Auto-publication (race-safe)
    // -------------------------------------------
    const courtLogRef = db.collection("courtLogs").doc();

    await db.runTransaction(async (tx) => {
      const freshSnap = await tx.get(caseRef);
      if (!freshSnap.exists) return;

      const freshData = freshSnap.data();
      if (freshData.status !== "open") return;

      tx.update(caseRef, {
        status: "published",
        verdict,
        counts,
        decidedAt: now,
        publishedAt: now,
        publishedCourtLogId: courtLogRef.id,
      });

      tx.create(courtLogRef, {
        title: freshData.title || "Community Court Ruling",
        summary: `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`,
        status: "Closed",
        jurisdiction: "TGK Community Court",
        createdBy: "system",
        createdAt: now,
        publishedAt: now,
        tags: ["jury", "verdict", verdict],
      });

      tx.create(courtLogRef.collection("entries").doc("verdict"), {
        type: "ruling",
        body: `Verdict: ${verdict.toUpperCase()}. Votes: ${counts.for} for, ${counts.against} against, ${counts.abstain} abstained.`,
        sequence: 1,
        createdBy: "system",
        createdAt: now,
      });
    });

    // -------------------------------------------
    // Final response
    // -------------------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result: {
          status: "published",
          verdict,
          counts,
          totalVotes,
          nonAbstain,
          requiredVotes: effectiveMinVotes,
        },
      }),
    };
  } catch (err) {
    console.error("Vote error:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: err.message || "Unknown error",
      }),
    };
  }
};

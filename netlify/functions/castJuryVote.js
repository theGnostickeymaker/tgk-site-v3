const admin = require("firebase-admin");

function initAdmin() {
  if (admin.apps.length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase admin env vars missing");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

initAdmin();
const db = admin.firestore();

/* ===========================
   POLICY CONSTANTS
=========================== */
const MIN_TOTAL_VOTES = 7;
const SUPERMAJORITY_NUM = 2;
const SUPERMAJORITY_DEN = 3;

function ceilDiv(num, den) {
  return Math.floor((num + den - 1) / den);
}

function requiredForVotes(nonAbstain) {
  // ceil((2/3) * nonAbstain) with integer arithmetic
  return ceilDiv(SUPERMAJORITY_NUM * nonAbstain, SUPERMAJORITY_DEN);
}

async function getUidFromAuthHeader(event) {
  const header =
    event.headers?.authorization || event.headers?.Authorization || "";
  if (!header.startsWith("Bearer ")) return null;

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;

  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded?.uid || null;
}

async function countVotes(caseRef) {
  const votesSnap = await caseRef.collection("votes").get();

  const counts = { for: 0, against: 0, abstain: 0 };
  votesSnap.forEach((doc) => {
    const v = doc.data()?.vote;
    if (v === "for" || v === "against" || v === "abstain") counts[v]++;
  });

  const totalVotes = counts.for + counts.against + counts.abstain;
  const nonAbstain = counts.for + counts.against;

  return { counts, totalVotes, nonAbstain };
}

/**
 * Adjudicate and, if threshold met, publish verdict to courtLogs.
 * Idempotent:
 * - If already published, returns published.
 * - If still under threshold, returns pending.
 */
async function adjudicateAndMaybePublish(caseId) {
  const caseRef = db.collection("juryCases").doc(caseId);

  // Quick existence check before expensive work
  const caseSnap = await caseRef.get();
  if (!caseSnap.exists) {
    return { status: "not_found" };
  }

  const caseData = caseSnap.data() || {};
  if (caseData.status === "published") {
    return {
      status: "published",
      verdict: caseData.verdict || null,
      publishedCourtLogId: caseData.publishedCourtLogId || null,
      counts: caseData.counts || null,
    };
  }

  if (caseData.status !== "open") {
    return { status: caseData.status || "unknown" };
  }

  const { counts, totalVotes, nonAbstain } = await countVotes(caseRef);

  if (totalVotes < MIN_TOTAL_VOTES || nonAbstain === 0) {
    return { status: "pending", counts, totalVotes, nonAbstain };
  }

  const required = requiredForVotes(nonAbstain);
  const verdict = counts.for >= required ? "sanction" : "dismissed";
  const now = admin.firestore.Timestamp.now();

  // Publish as immutable precedent log
  const courtLogRef = db.collection("courtLogs").doc(); // auto id

  // Single ruling entry is enough for first version
  const rulingBody =
    `Verdict: ${verdict.toUpperCase()} ` +
    `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(caseRef);
    if (!snap.exists) throw new Error("Jury case vanished");

    const d = snap.data() || {};

    // Idempotency guards
    if (d.status === "published") return;
    if (d.status !== "open") return;

    // Re-check votes inside transaction boundary (light re-check via stored values is not possible),
    // so we rely on our computed counts and accept minor race. If two publishes race,
    // only one will win because we set published state in this same transaction.
    tx.update(caseRef, {
      status: "published",
      verdict,
      counts,
      jurySummary: `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`,
      decidedAt: now,
      publishedAt: now,
      publishedCourtLogId: courtLogRef.id,
    });

    tx.create(courtLogRef, {
      title: d.title || "Jury Case",
      summary: `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`,
      status: "Closed",
      jurisdiction: "TGK Community Court",
      createdBy: "system",
      createdAt: now,
      publishedAt: now,
      tags: ["jury", "verdict", verdict],
    });

    const entryRef = courtLogRef.collection("entries").doc("entry-001");
    tx.create(entryRef, {
      type: "ruling",
      body: rulingBody,
      sequence: 1,
      createdBy: "system",
      createdAt: now,
    });
  });

  return {
    status: "published",
    verdict,
    counts,
    totalVotes,
    nonAbstain,
    publishedCourtLogId: courtLogRef.id,
  };
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const uid = await getUidFromAuthHeader(event);
    if (!uid) {
      return { statusCode: 401, body: "Missing or invalid auth token" };
    }

    const payload = JSON.parse(event.body || "{}");
    const { caseId, vote } = payload;

    if (!caseId || !vote) {
      return { statusCode: 400, body: "Missing caseId or vote" };
    }

    if (!["for", "against", "abstain"].includes(vote)) {
      return { statusCode: 400, body: "Invalid vote" };
    }

    const caseRef = db.collection("juryCases").doc(caseId);
    const caseSnap = await caseRef.get();

    if (!caseSnap.exists) {
      return { statusCode: 404, body: "Jury case not found" };
    }

    const caseData = caseSnap.data() || {};
    if (caseData.status !== "open") {
      return {
        statusCode: 409,
        body: JSON.stringify({ status: caseData.status, message: "Case not open" }),
      };
    }

    // Optional: enforce juror assignment
    const jurorRef = caseRef.collection("jurors").doc(uid);
    const jurorSnap = await jurorRef.get();
    if (!jurorSnap.exists) {
      return { statusCode: 403, body: "Not an assigned juror" };
    }

    // One vote per juror, doc id is uid
    const voteRef = caseRef.collection("votes").doc(uid);
    const now = admin.firestore.Timestamp.now();

    await db.runTransaction(async (tx) => {
      const existing = await tx.get(voteRef);
      if (existing.exists) {
        // Immutable vote. If they already voted, we do not overwrite.
        return;
      }
      tx.create(voteRef, { vote, castAt: now });
    });

    // Adjudicate and auto publish if threshold met
    const result = await adjudicateAndMaybePublish(caseId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        castBy: uid,
        caseId,
        vote,
        result,
      }),
    };
  } catch (err) {
    console.error("castJuryVote error:", err);
    return { statusCode: 500, body: "Internal error" };
  }
};

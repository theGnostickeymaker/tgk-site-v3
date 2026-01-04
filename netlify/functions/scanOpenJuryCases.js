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

const MIN_TOTAL_VOTES = 7;
const SUPERMAJORITY_NUM = 2;
const SUPERMAJORITY_DEN = 3;

function ceilDiv(num, den) {
  return Math.floor((num + den - 1) / den);
}

function requiredForVotes(nonAbstain) {
  return ceilDiv(SUPERMAJORITY_NUM * nonAbstain, SUPERMAJORITY_DEN);
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

async function adjudicateAndMaybePublish(caseRef, caseId) {
  const caseSnap = await caseRef.get();
  if (!caseSnap.exists) return { caseId, status: "not_found" };

  const caseData = caseSnap.data() || {};
  if (caseData.status === "published") {
    return { caseId, status: "published" };
  }
  if (caseData.status !== "open") {
    return { caseId, status: caseData.status || "unknown" };
  }

  const { counts, totalVotes, nonAbstain } = await countVotes(caseRef);

  if (totalVotes < MIN_TOTAL_VOTES || nonAbstain === 0) {
    return { caseId, status: "pending", totalVotes };
  }

  const required = requiredForVotes(nonAbstain);
  const verdict = counts.for >= required ? "sanction" : "dismissed";
  const now = admin.firestore.Timestamp.now();
  const courtLogRef = db.collection("courtLogs").doc();

  const rulingBody =
    `Verdict: ${verdict.toUpperCase()} ` +
    `${counts.for} for, ${counts.against} against, ${counts.abstain} abstained`;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(caseRef);
    if (!snap.exists) return;

    const d = snap.data() || {};
    if (d.status === "published") return;
    if (d.status !== "open") return;

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

  return { caseId, status: "published", verdict, publishedCourtLogId: courtLogRef.id };
}

exports.handler = async () => {
  try {
    // Scan a batch of open cases. You can increase limit later.
    const snap = await db
      .collection("juryCases")
      .where("status", "==", "open")
      .limit(25)
      .get();

    const results = [];

    for (const doc of snap.docs) {
      const caseId = doc.id;
      const caseRef = db.collection("juryCases").doc(caseId);
      const r = await adjudicateAndMaybePublish(caseRef, caseId);
      results.push(r);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        scanned: snap.size,
        results,
      }),
    };
  } catch (err) {
    console.error("scanOpenJuryCases error:", err);
    return { statusCode: 500, body: "Internal scan error" };
  }
};

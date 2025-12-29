const admin = require("firebase-admin");

/**
 * Initialise Firebase Admin once for the Eleventy build.
 * This code runs server-side only.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * Normalise tags to a clean string array.
 * Handles legacy stringified arrays safely.
 */
function normaliseTags(tags) {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.flatMap((t) => {
      if (typeof t === "string" && t.trim().startsWith("[")) {
        try {
          return JSON.parse(t);
        } catch {
          return [t];
        }
      }
      return t;
    });
  }

  if (typeof tags === "string") {
    try {
      return JSON.parse(tags);
    } catch {
      return [tags];
    }
  }

  return [];
}

/**
 * Build-time Court Logs data source.
 * Produces a complete, immutable precedent archive.
 */
module.exports = async function courtLogsData() {
  try {
    const db = admin.firestore();

    const logsSnapshot = await db
      .collection("courtLogs")
      .orderBy("publishedAt", "desc")
      .get();

    const logs = [];

    for (const doc of logsSnapshot.docs) {
      const logData = doc.data();

      const entriesSnapshot = await doc.ref
        .collection("entries")
        .orderBy("sequence", "asc")
        .get();

      const entries = entriesSnapshot.docs.map((entryDoc) => ({
        id: entryDoc.id,
        ...entryDoc.data(),
      }));

      logs.push({
        id: doc.id,
        ...logData,
        tags: normaliseTags(logData.tags),
        entries,
      });
    }

    return { logs };
  } catch (error) {
    console.error("[CourtLogs] Build-time fetch failed:", error);
    return { logs: [] };
  }
};

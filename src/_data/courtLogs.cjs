const { getAdmin } = require("../lib/firebase-admin.cjs");

module.exports = async function courtLogsData() {
  try {
    const admin = getAdmin();
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

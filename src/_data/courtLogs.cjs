const admin = require("firebase-admin");

/**
 * Initialise Firebase Admin once for the Eleventy build.
 * This runs server-side only and never ships to the browser.
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Netlify stores multiline secrets with escaped newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * Build-time Court Logs data source
 * Returns an immutable, public precedent archive
 */
module.exports = async function courtLogsData() {
  try {
    const db = admin.firestore();

    const snapshot = await db
      .collection("courtLogs")
      .orderBy("publishedAt", "desc")
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { logs };
  } catch (error) {
    console.error("[CourtLogs] Build-time fetch failed:", error);
    return { logs: [] };
  }
};

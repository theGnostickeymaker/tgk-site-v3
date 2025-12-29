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

module.exports = async () => {
  try {
    const db = admin.firestore();

    const snap = await db
      .collection("courtLogs")
      .orderBy("publishedAt", "desc")
      .get();

    const logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return { logs };
  } catch (err) {
    console.error("CourtLogs build fetch failed:", err);
    return { logs: [] };
  }
};

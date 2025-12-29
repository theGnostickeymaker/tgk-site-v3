// netlify/functions/get-court-logs.js
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

exports.handler = async () => {
  try {
    const db = admin.firestore();

    const snap = await db
      .collection("courtLogs")
      .orderBy("publishedAt", "desc")
      .limit(50)
      .get();

    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ logs }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

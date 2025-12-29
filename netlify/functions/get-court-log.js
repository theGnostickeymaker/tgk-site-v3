// netlify/functions/get-court-log.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY)),
  });
}

exports.handler = async (event) => {
  try {
    const logId = event.queryStringParameters?.id;
    if (!logId) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

    const db = admin.firestore();

    const logRef = db.collection("courtLogs").doc(logId);
    const logSnap = await logRef.get();
    if (!logSnap.exists) return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };

    const entriesSnap = await logRef
      .collection("entries")
      .orderBy("sequence", "asc")
      .get();

    const entries = entriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: logSnap.id, ...logSnap.data(), entries }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

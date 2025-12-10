// src/js/reputation.js
import { db, auth } from "/js/firebase-init.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

export const Reputation = {

  async get(uid = null) {
    const user = auth.currentUser;
    if (!user) return null;

    const target = uid || user.uid;
    const ref = doc(db, "reputation", target);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  async awardPoints(toUserId, points, type = "award", details = "", topicId = null) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const idToken = await user.getIdToken();

    const res = await fetch("/.netlify/functions/rep-award", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Firebase-Token": idToken
      },
      body: JSON.stringify({ toUserId, points, type, details, topicId })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`rep-award failed (${res.status}): ${errorBody}`);
    }

    return res.json();
  }
};

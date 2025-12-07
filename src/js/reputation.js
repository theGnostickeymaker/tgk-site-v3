// src/js/reputation.js

import { db, auth } from "/js/firebase-init.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// -------------------------------------------------------
// Reputation API (Keys)
// -------------------------------------------------------
export const Reputation = {

  // Fetch current user's reputation document
  async get() {
    const user = auth.currentUser;
    if (!user) return null;

    const ref = doc(db, "reputation", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data();
  },

  /**
   * Automatically award Keys to the current user.
   * The server verifies the ID token and writes Firestore.
   */
  async awardPoints(points, type = "award", details = "", topicId = null) {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    const idToken = await user.getIdToken();

    const res = await fetch("/.netlify/functions/rep-award", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Firebase-Token": idToken
      },
      body: JSON.stringify({ points, type, details, topicId })
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      throw new Error(`rep-award failed (${res.status}): ${errorBody}`);
    }

    return res.json();
  }
};

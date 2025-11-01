/* ===========================================================
   🧠 TGK Widget — Quiz Progress Tracker (v0.1 seed)
   =========================================================== */

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { app } from "/js/firebase-init.js";


const auth = getAuth(app);
const db = getFirestore(app);
const mountId = "widget-quiz-progress";

async function renderQuizProgress(user) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `<p class="muted small">Loading quiz progress…</p>`;

  try {
    const snap = await getDocs(collection(db, "quizScores", user.uid, "scores"));
    if (snap.empty) {
      mount.innerHTML = `<p class="muted small">No completed quizzes yet.</p>`;
      return;
    }

    let total = 0, perfect = 0;
    snap.forEach(d => {
      const data = d.data();
      total++;
      if (data.score === data.total) perfect++;
    });

    mount.innerHTML = `
      <div class="widget-box">
        <h3>Quiz Progress</h3>
        <p>You’ve completed <strong>${total}</strong> quizzes.</p>
        <p>Perfect scores: <strong>${perfect}</strong></p>
      </div>
    `;
  } catch (err) {
    console.error("[TGK Quiz Widget] Error:", err);
    mount.innerHTML = `<p class="muted small">Error loading quiz data.</p>`;
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) renderQuizProgress(user);
});

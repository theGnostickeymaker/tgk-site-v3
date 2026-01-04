/* ===========================================================
   TGK — Dashboard Jury Console
   =========================================================== */
console.log("[Jury] dashboard-jury.js loaded");

import { app } from "./firebase-init.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

export async function loadJuryConsole(user) {
  console.log("[Jury] loadJuryConsole called for", user?.uid);
  if (!user) return;

  const consoleEl = document.getElementById("jury-console");
  const casesEl = document.getElementById("jury-cases");

  if (!consoleEl || !casesEl) return;

  // Step 1: find jury cases where this user is assigned
  const juryCasesRef = collection(db, "juryCases");
  const q = query(juryCasesRef, where("status", "==", "open"));

  const snap = await getDocs(q);

  const assignedCases = [];

  for (const caseDoc of snap.docs) {
    const jurorRef = doc(
      db,
      "juryCases",
      caseDoc.id,
      "jurors",
      user.uid
    );

    const jurorSnap = await getDoc(jurorRef);
    if (jurorSnap.exists()) {
      assignedCases.push({
        id: caseDoc.id,
        ...caseDoc.data()
      });
    }
  }

  if (!assignedCases.length) {
    return; // user is not a juror anywhere
  }

  // Reveal console
  consoleEl.hidden = false;
  casesEl.innerHTML = "";

  for (const jc of assignedCases) {
    casesEl.appendChild(renderJuryCase(jc));
  }
}

function renderJuryCase(juryCase) {
  const el = document.createElement("div");
  el.className = "jury-case-card";

  el.innerHTML = `
    <h4 class="jury-case-title">${juryCase.title || "Community Case"}</h4>
    <p class="small muted">
      Threshold: ${juryCase.threshold || "two-thirds"} ·
      Required votes: ${juryCase.requiredVotes || "—"}
    </p>

    <div class="jury-vote-actions">
      <button data-vote="for" class="btn outline small">For</button>
      <button data-vote="against" class="btn outline small">Against</button>
      <button data-vote="abstain" class="btn outline small">Abstain</button>
    </div>

    <p class="jury-status muted small"></p>
  `;

  el.querySelectorAll("button[data-vote]").forEach(btn => {
    btn.addEventListener("click", () =>
      castVote(juryCase.id, btn.dataset.vote, el)
    );
  });

  return el;
}

async function castVote(caseId, vote, container) {
  const statusEl = container.querySelector(".jury-status");
  statusEl.textContent = "Submitting vote…";

  const user = auth.currentUser;
  const token = await user.getIdToken();

  const res = await fetch("/.netlify/functions/castJuryVote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ caseId, vote })
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    statusEl.textContent = data.message || "Vote failed.";
    return;
  }

  statusEl.textContent =
    data.result.status === "published"
      ? "Verdict reached. Case closed."
      : "Vote recorded.";
}

/* ===========================================================
   TGK — Dashboard Jury Console (Corrected)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

export async function loadJuryConsole(user) {
  if (!user) return;

  console.log("[Jury] Loading jury console for", user.uid);

  const consoleEl = document.getElementById("jury-console");
  const casesEl = document.getElementById("jury-cases");

  if (!consoleEl || !casesEl) return;

  casesEl.innerHTML = "<p class='muted small'>Checking jury assignments…</p>";

  const juryCasesSnap = await getDocs(collection(db, "juryCases"));
  const assignedCases = [];

  for (const caseDoc of juryCasesSnap.docs) {
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
    console.log("[Jury] No assigned cases");
    return;
  }

  console.log("[Jury] Assigned cases found:", assignedCases.length);

  // 🔓 Reveal console ONLY now
  consoleEl.hidden = false;
  casesEl.innerHTML = "";

  assignedCases.forEach(juryCase => {
    casesEl.appendChild(renderJuryCase(juryCase));
  });
}

function renderJuryCase(juryCase) {
  const el = document.createElement("div");
  el.className = "jury-case-card";

  el.innerHTML = `
    <h4 class="jury-case-title">
      ${juryCase.title || "Community Case"}
    </h4>

    <p class="small muted">
      Status: ${juryCase.status || "unknown"} ·
      Required votes: ${juryCase.requiredVotes ?? "—"}
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

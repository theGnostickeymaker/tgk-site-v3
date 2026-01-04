import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

function qs(id) {
  return document.getElementById(id);
}

function getCaseIdFromUrl() {
  return new URLSearchParams(window.location.search).get("case");
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/signin/");
    return;
  }

  const caseId = getCaseIdFromUrl();

  if (!caseId) {
    qs("case-body").innerHTML =
      `<p class="muted small">Invalid or missing jury case.</p>`;
    return;
  }

  try {
    await loadCase(user, caseId);
  } catch (err) {
    console.error("[Jury Case] Fatal error:", err);
    qs("case-body").innerHTML =
      `<p class="muted small">Unable to load jury case.</p>`;
  }
});


/* ============================================================
   Load case
============================================================ */

async function loadCase(user, caseId) {
    
console.log("[Jury Case] Loading case:", caseId, "for user:", user.uid);

  const caseRef = doc(db, "juryCases", caseId);
  const caseSnap = await getDoc(caseRef);

  if (!caseSnap.exists()) {
    qs("case-body").innerHTML =
      `<p class="muted small">Case not found.</p>`;
    return;
  }

  const caseData = caseSnap.data();

  // Juror check
  const jurorRef = doc(db, "juryCases", caseId, "jurors", user.uid);
  const jurorSnap = await getDoc(jurorRef);

  if (!jurorSnap.exists()) {
    qs("case-body").innerHTML =
      `<p class="muted small">You are not assigned to this jury.</p>`;
    return;
  }

  // Header
  qs("case-title").textContent = caseData.title;
  qs("case-status").textContent = `Status: ${caseData.status}`;

  qs("case-body").innerHTML = `
    <p class="lead">
      This case is open for community review.
    </p>
    <p class="muted small">
      Required votes: ${caseData.requiredVotes}
    </p>
  `;

  // Vote state
  const voteRef = doc(db, "juryCases", caseId, "votes", user.uid);
  const voteSnap = await getDoc(voteRef);

  if (voteSnap.exists() || caseData.status !== "open") {
    qs("jury-actions").hidden = true;
    qs("jury-locked").hidden = false;
    return;
  }

  qs("jury-actions").hidden = false;
  bindVoteButtons(user, caseId);
}

/* ============================================================
   Voting (Netlify function)
============================================================ */

function bindVoteButtons(user, caseId) {
  document.querySelectorAll("[data-vote]").forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      await castVote(user, caseId, btn.dataset.vote);
    });
  });
}

async function castVote(user, caseId, vote) {
  try {
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

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Vote failed");
    }

    qs("jury-actions").hidden = true;
    qs("jury-locked").hidden = false;

  } catch (err) {
    console.error("[Jury Vote] Failed:", err);
    alert("Unable to cast vote. Please try again.");
  }
}

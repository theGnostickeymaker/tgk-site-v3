import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

/* ============================================================
   Helpers
============================================================ */

function getCaseIdFromUrl() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  // /court/jury/{caseId}/
  return parts[parts.length - 1];
}

function qs(id) {
  return document.getElementById(id);
}

/* ============================================================
   Main loader
============================================================ */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/signin/");
    return;
  }

  const caseId = getCaseIdFromUrl();
  if (!caseId) {
    qs("case-body").innerHTML =
      `<p class="muted small">Invalid jury case.</p>`;
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
   Core logic
============================================================ */

async function loadCase(user, caseId) {
  const caseRef = doc(db, "juryCases", caseId);
  const caseSnap = await getDoc(caseRef);

  if (!caseSnap.exists()) {
    qs("case-body").innerHTML =
      `<p class="muted small">Case not found.</p>`;
    return;
  }

  const caseData = caseSnap.data();

  // Check juror assignment
  const jurorRef = doc(db, "juryCases", caseId, "jurors", user.uid);
  const jurorSnap = await getDoc(jurorRef);

  if (!jurorSnap.exists()) {
    qs("case-body").innerHTML =
      `<p class="muted small">You are not assigned to this jury.</p>`;
    return;
  }

  // Populate header
  qs("case-title").textContent = caseData.title;
  qs("case-status").textContent = `Status: ${caseData.status}`;

  // Case body (expand later)
  qs("case-body").innerHTML = `
    <p class="lead">
      This case is open for community review.
    </p>
    <p class="muted small">
      Required votes: ${caseData.requiredVotes}
    </p>
  `;

  // Check vote state
  const voteRef = doc(db, "juryCases", caseId, "votes", user.uid);
  const voteSnap = await getDoc(voteRef);

  if (voteSnap.exists() || caseData.status !== "open") {
    qs("jury-actions").hidden = true;
    qs("jury-locked").hidden = false;
    return;
  }

  // Enable voting
  qs("jury-actions").hidden = false;
  bindVoteButtons(user, caseId);
}

/* ============================================================
   Voting
============================================================ */

function bindVoteButtons(user, caseId) {
  const buttons = document.querySelectorAll("[data-vote]");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const vote = btn.dataset.vote;
      await castVote(user, caseId, vote);
    });
  });
}

async function castVote(user, caseId, vote) {
  const voteRef = doc(db, "juryCases", caseId, "votes", user.uid);

  try {
    await setDoc(voteRef, {
      vote,
      castAt: serverTimestamp()
    });

    qs("jury-actions").hidden = true;
    qs("jury-locked").hidden = false;

  } catch (err) {
    console.error("[Jury Vote] Failed:", err);
    alert("Unable to cast vote. Please try again.");
  }
}

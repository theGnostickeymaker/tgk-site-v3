/* ============================================================
   TGK Community — Voting System (v1.0)
   Supports:
     • Upvotes
     • Per-user vote state
     • Real-time updates via onSnapshot
============================================================ */

import { db, auth } from "/js/firebase-init.js";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

let currentUser = null;

// Track authentication
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// Initialiser
document.addEventListener("DOMContentLoaded", () => {
  attachVoteHandlers();
  observeAllVotes();
});

/* ============================================================
   1. Attach click listeners to vote buttons
============================================================ */

function attachVoteHandlers() {
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".vote-btn");
    if (!btn) return;

    if (!currentUser) {
      alert("You must be signed in to vote.");
      return;
    }

    const replyId = btn.dataset.replyId;
    const topicId = btn.dataset.topicId;
    if (!replyId || !topicId) return;

    await toggleVote(topicId, replyId);
  });
}

/* ============================================================
   2. Toggle vote for this user
============================================================ */

async function toggleVote(topicId, replyId) {
  const ref = doc(db, "topics", topicId, "replies", replyId, "votes", currentUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Remove existing vote
    await deleteDoc(ref);
    return;
  }

  // Cast new upvote
  await setDoc(ref, {
    value: 1,
    createdAt: serverTimestamp()
  });
}

/* ============================================================
   3. Observe votes on all replies in real time
============================================================ */

function observeAllVotes() {
  const containers = document.querySelectorAll("[data-reply-id]");

  containers.forEach((card) => {
    const replyId = card.dataset.replyId;
    const root = card.closest("#discussion-root");
    if (!root) return;

    const topicId = root.dataset.topicId;

    const votesRef = collection(db, "topics", topicId, "replies", replyId, "votes");

    onSnapshot(votesRef, (snapshot) => {
      const count = snapshot.size;

      const countEl = card.querySelector(".vote-count");
      if (countEl) countEl.textContent = count;

      highlightUserVote(card, snapshot);
    });
  });
}

/* ============================================================
   4. Highlight user's vote
============================================================ */

function highlightUserVote(card, snapshot) {
  if (!currentUser) {
    card.querySelectorAll(".vote-btn").forEach(btn =>
      btn.classList.remove("active")
    );
    return;
  }

  const userHasVoted = snapshot.docs.some(doc => doc.id === currentUser.uid);

  const btn = card.querySelector(".vote-btn");
  if (!btn) return;

  if (userHasVoted) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
  }
}

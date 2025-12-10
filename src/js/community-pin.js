/* ============================================================
   TGK Community — Pinned Replies System (v1.0)
   Admin-only feature.
============================================================ */

import { db, auth } from "/js/firebase-init.js";
import {
  doc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// Admin click handler
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".btn-pin-reply");
    if (!btn) return;

    if (!currentUser) {
      alert("Only administrators may pin replies.");
      return;
    }

    const isAdmin = await hasAdminTier(currentUser);
    if (!isAdmin) {
      alert("You must be an administrator to pin replies.");
      return;
    }

    const replyId = btn.dataset.replyId;
    const topicId = btn.dataset.topicId;

    if (!replyId || !topicId) return;

    await togglePin(topicId, replyId);
  });

  observePinnedState();
});

/* ============================================================
   1. Determine whether the user is admin
============================================================ */

async function hasAdminTier(user) {
  if (!user) return false;
  const token = await user.getIdTokenResult();
  return token.claims.tier === "admin" || token.claims.role === "admin";
}

/* ============================================================
   2. Toggle pinned value in Firestore
============================================================ */

async function togglePin(topicId, replyId) {
  const ref = doc(db, "topics", topicId, "replies", replyId);

  // Read existing pinned state using a live listener
  const unsubscribe = onSnapshot(ref, async (snap) => {
    const data = snap.data() || {};
    const newValue = !data.pinned;

    await updateDoc(ref, { pinned: newValue });
    unsubscribe();
  });
}

/* ============================================================
   3. Observe pinned state for ALL replies
============================================================ */

function observePinnedState() {
  const cards = document.querySelectorAll("[data-reply-id]");

  cards.forEach((card) => {
    const replyId = card.dataset.replyId;
    const root = card.closest("#discussion-root");
    if (!root) return;

    const topicId = root.dataset.topicId;

    const ref = doc(db, "topics", topicId, "replies", replyId);

    onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (!data) return;

      const pinned = data.pinned === true;

      card.classList.toggle("is-pinned", pinned);

      const badge = card.querySelector(".pinned-badge");
      if (pinned) {
        if (!badge) {
          const newBadge = document.createElement("span");
          newBadge.className = "pinned-badge";
          newBadge.textContent = "Pinned";
          card
            .querySelector(".discussion-message-header")
            ?.appendChild(newBadge);
        }
      } else {
        badge?.remove();
      }
    });
  });
}

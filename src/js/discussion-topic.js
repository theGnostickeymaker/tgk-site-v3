// /js/discussion-topic.js
// TGK Community - Topic level discussion engine with Keys integration

import { auth, db } from "/js/firebase-init.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Reputation integration
import { Reputation } from "./reputation.js";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("discussion-root");
  if (!root) return;

  const topicId = root.getAttribute("data-topic-id");
  if (!topicId) return;

  const minWriteTierAttr = root.getAttribute("data-min-write-tier") || "initiate";

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  let currentUser = null;
  let currentTier = "free";
  let currentPseudonym = null;

  // --------------------------
  // Tier helpers
  // --------------------------
  function tierRank(tier) {
    switch (tier) {
      case "initiate": return 1;
      case "adept":    return 2;
      case "admin":    return 3;
      default:         return 0;
    }
  }

  function minTierSatisfied() {
    return tierRank(currentTier) >= tierRank(minWriteTierAttr);
  }

  function setFormEnabled(enabled, message) {
    if (!form) return;

    if (enabled) {
      form.classList.remove("is-disabled");
      Array.from(form.elements).forEach(el => el.disabled = false);
    } else {
      form.classList.add("is-disabled");
      Array.from(form.elements).forEach(el => {
        if (el.tagName !== "P") el.disabled = true;
      });
    }

    if (authHintEl && message) {
      authHintEl.textContent = message;
    }
  }

  // --------------------------
  // Auth tracking
  // --------------------------
  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    currentTier = "free";

    if (!user) {
      setFormEnabled(false, "You are currently signed out. Sign in to your TGK account to join the discussion.");
      return;
    }

    try {
      const tokenResult = await user.getIdTokenResult();
      currentTier = tokenResult.claims.tier || "free";
    } catch (err) {
      console.error("Unable to read user tier from claims:", err);
      currentTier = "free";
    }

    if (!minTierSatisfied()) {
      setFormEnabled(false, `You can read all replies, but must upgrade to the “${minWriteTierAttr}” tier to contribute.`);
      return;
    }

    setFormEnabled(true, "You are signed in. Your contribution will appear with your chosen pseudonym.");
  });

  // --------------------------
  // Load replies (real time)
  // --------------------------
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, (snapshot) => {
    if (!messagesEl) return;

    if (snapshot.empty) {
      messagesEl.innerHTML = `
        <p class="muted small">
          No contributions yet. Be the first to offer a Steel Man summary.
        </p>
      `;
      return;
    }

    messagesEl.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const replyId = docSnap.id;

      const container = document.createElement("article");
      container.className = "discussion-message";
      container.id = `comment-${replyId}`;
      container.dataset.replyId = replyId;

      const header = document.createElement("div");
      header.className = "discussion-message-header";

      const author = document.createElement("span");
      author.className = "discussion-message-author";
      author.textContent = data.pseudonym || "Anonymous Seeker";

      const meta = document.createElement("span");
      meta.className = "discussion-message-meta";
      const ts = data.createdAt?.toDate?.() || null;
      meta.textContent = ts
        ? ts.toLocaleString()
        : "Pending timestamp";

      header.appendChild(author);
      header.appendChild(meta);

      const steel = document.createElement("div");
      steel.className = "discussion-message-steelman reply-steelman-body";
      steel.textContent = data.steelmanSummary || "";

      const body = document.createElement("div");
      body.className = "discussion-message-body reply-body-text";
      body.textContent = data.body || "";

      container.appendChild(header);
      if (data.steelmanSummary) container.appendChild(steel);
      container.appendChild(body);

      messagesEl.appendChild(container);
    });
  });

  // --------------------------
  // Handle submit
  // --------------------------
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!currentUser) {
        if (statusEl) statusEl.textContent = "You must be signed in to post.";
        return;
      }

      if (!minTierSatisfied()) {
        if (statusEl) {
          statusEl.textContent = `Your current tier (“${currentTier}”) is not sufficient to post here.`;
        }
        return;
      }

      const steelField = form.querySelector("#steelman-summary");
      const bodyField = form.querySelector("#reply-body");
      const pseudoField = form.querySelector("#pseudonym");

      const steelText = steelField?.value.trim() || "";
      const bodyText = bodyField?.value.trim() || "";
      const pseudoText = pseudoField?.value.trim() || "";

      const steelWords = steelText.split(/\s+/).filter(Boolean).length;
      const bodyWords = bodyText.split(/\s+/).filter(Boolean).length;

      if (steelWords < 30) {
        if (statusEl) {
          statusEl.textContent = "Your Steel Man summary is too short. Aim for at least 30 words.";
        }
        return;
      }

      if (bodyWords < 20) {
        if (statusEl) {
          statusEl.textContent = "Your response is too short. Aim for at least 20 words.";
        }
        return;
      }

      if (statusEl) statusEl.textContent = "Posting reply...";

      try {
        await addDoc(repliesRef, {
          userId: currentUser.uid,
          pseudonym: pseudoText || currentPseudonym || "Anonymous Seeker",
          steelmanSummary: steelText,
          body: bodyText,
          createdAt: serverTimestamp(),
          parentReplyId: null
        });

        try {
          await Reputation.awardPoints(
            1,
            "reply",
            `Reply posted in topic ${topicId}`,
            topicId
          );
        } catch (repErr) {
          console.warn("Reputation award failed:", repErr);
        }

        steelField.value = "";
        bodyField.value = "";

        if (statusEl) statusEl.textContent = "Reply posted.";
      } catch (err) {
        console.error(err);
        if (statusEl) {
          statusEl.textContent = "There was a problem posting your reply. Please try again.";
        }
      }
    });
  }
});

/* =============================================================
   TGK Community — Topic Engine v3.4 (Reddit-style Flat Threads)
   ============================================================= */

import { auth, db } from "/js/firebase-init.js";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { Reputation } from "./reputation.js";

document.addEventListener("DOMContentLoaded", () => {

  /* -----------------------------------------------------------
     Core DOM references
     ----------------------------------------------------------- */
  const root = document.getElementById("discussion-root");
  if (!root) return;

  const topicId = root.dataset.topicId;
  const minWriteTierAttr = root.dataset.minWriteTier || "initiate";

  const form = document.getElementById("discussion-form");
  const messagesEl = document.getElementById("discussion-messages");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");

  const parentReplyField = document.getElementById("parent-reply-id");
  const replyContext = document.getElementById("reply-context");
  const replyContextSnippet =
    document.getElementById("reply-context-snippet");

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  const reputationSubscriptions = new Map();

  /* -----------------------------------------------------------
     Tier helpers
     ----------------------------------------------------------- */
  function tierRank(tier) {
    return { initiate: 1, adept: 2, admin: 3 }[tier] || 0;
  }

  function minTierSatisfied() {
    return tierRank(currentTier) >= tierRank(minWriteTierAttr);
  }

  function setFormEnabled(enabled, message) {
    if (!form) return;
    form.classList.toggle("is-disabled", !enabled);
    Array.from(form.elements).forEach(el => {
      if (el.tagName !== "P") el.disabled = !enabled;
    });
    if (authHintEl && message) authHintEl.textContent = message;
  }

  /* -----------------------------------------------------------
     Reputation helpers
     ----------------------------------------------------------- */
  function badgeFor(score) {
    if (score >= 500) return "🜂";
    if (score >= 200) return "⟆";
    if (score >= 50) return "✦";
    if (score >= 1) return "✧";
    return "";
  }

  function extractScore(rep) {
    return rep?.total ?? rep?.score ?? 0;
  }

  function updateAuthorBadges(userId, repData) {
    const score = extractScore(repData);
    const badge = badgeFor(score);

    document
      .querySelectorAll(
        `.discussion-message[data-user-id="${userId}"] .discussion-message-author`
      )
      .forEach(el => {
        const base =
          el.dataset.baseName ||
          el.textContent.replace(/[🜂⟆✦✧]/g, "").trim();
        el.dataset.baseName = base;
        el.textContent = badge ? `${base} ${badge}` : base;
      });
  }

  function ensureReputationSubscription(userId) {
    if (
      !userId ||
      reputationSubscriptions.has(userId) ||
      (!currentUser && !isAdmin) ||
      (currentUser && currentUser.uid !== userId && !isAdmin)
    ) return;

    const ref = doc(db, "reputation", userId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) updateAuthorBadges(userId, snap.data());
    });

    reputationSubscriptions.set(userId, unsub);
  }

  /* -----------------------------------------------------------
     Auth tracking
     ----------------------------------------------------------- */
  onAuthStateChanged(auth, async user => {
    currentUser = user || null;
    currentTier = "free";
    isAdmin = false;

    if (!user) {
      setFormEnabled(false, "Sign in to participate.");
      return;
    }

    try {
      const token = await user.getIdTokenResult();
      currentTier = token.claims.tier || "free";
      isAdmin =
        token.claims.tier === "admin" ||
        token.claims.role === "admin";
    } catch {}

    if (!minTierSatisfied()) {
      setFormEnabled(false,
        `Upgrade to “${minWriteTierAttr}” to reply.`
      );
      return;
    }

    setFormEnabled(true, "You are signed in.");
  });

  /* -----------------------------------------------------------
     Firestore listener (flat render)
     ----------------------------------------------------------- */
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, snapshot => {
    messagesEl.innerHTML = "";

    if (snapshot.empty) {
      messagesEl.innerHTML =
        `<p class="muted small">No contributions yet.</p>`;
      return;
    }

    const replies = snapshot.docs.map(d => ({
      id: d.id,
      data: d.data()
    }));

    function depthOf(reply) {
      let depth = 0;
      let p = reply.data.parentReplyId;
      while (p) {
        const parent = replies.find(r => r.id === p);
        if (!parent) break;
        depth++;
        p = parent.data.parentReplyId;
      }
      return depth;
    }

    replies.forEach(r => {
      r.depth = depthOf(r);
      if (r.data.userId) ensureReputationSubscription(r.data.userId);
    });

    replies.forEach(r => {
      const card = buildReplyCard(r.id, r.data, r.depth);
      messagesEl.appendChild(card);
      setupVotes(topicId, r.id, card);
    });
  });

  /* -----------------------------------------------------------
     Build reply card
     ----------------------------------------------------------- */
  function buildReplyCard(replyId, data, depth) {
    const card = document.createElement("article");
    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.dataset.depth = depth;
    if (data.userId) card.dataset.userId = data.userId;
    if (data.pinned) card.classList.add("is-pinned");

    card.innerHTML = `
      <div class="discussion-message-header">
        <span class="discussion-message-author"
          data-base-name="${data.pseudonym || "Anonymous Seeker"}">
          ${data.pseudonym || "Anonymous Seeker"}
        </span>
        <span class="discussion-message-meta">
          ${data.createdAt?.toDate?.().toLocaleString() || "Pending"}
        </span>
      </div>

      ${data.steelmanSummary ? `
        <div class="discussion-message-steelman">
          <div class="steelman-label">Steel Man Summary</div>
          <div class="steelman-text">${data.steelmanSummary}</div>
        </div>` : ""}

      <div class="discussion-message-body">
        ${data.body || ""}
      </div>

      <div class="discussion-actions">
        <button class="btn-link btn-reply-comment"
          data-reply-id="${replyId}"
          data-snippet="${(data.steelmanSummary || data.body || "").slice(0,120)}">
          Reply
        </button>

        <div class="vote-group">
          ${["insight","agree","challenge"].map(type => `
            <button class="vote-btn"
              data-reply-id="${replyId}"
              data-vote-type="${type}">
              <span class="vote-count"
                data-count-type="${type}">0</span>
            </button>`).join("")}
        </div>
      </div>
    `;

    return card;
  }

  /* -----------------------------------------------------------
     Voting
     ----------------------------------------------------------- */
  function setupVotes(topicId, replyId, card) {
    const ref = collection(
      db, "topics", topicId, "replies", replyId, "votes"
    );

    onSnapshot(ref, snap => {
      const counts = { insight: 0, agree: 0, challenge: 0 };
      let userVote = null;

      snap.forEach(s => {
        const v = s.data();
        if (counts[v.type] != null) counts[v.type]++;
        if (currentUser && s.id === currentUser.uid) userVote = v.type;
      });

      Object.entries(counts).forEach(([t,c]) => {
        const el = card.querySelector(
          `.vote-count[data-count-type="${t}"]`
        );
        if (el) el.textContent = c;
      });

      card.querySelectorAll(".vote-btn").forEach(btn => {
        btn.classList.toggle(
          "active", btn.dataset.voteType === userVote
        );
      });
    });
  }

});

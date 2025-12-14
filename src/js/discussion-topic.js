/* =============================================================
   TGK Community — Topic Engine v3.6 (Reddit-style Flat Threads)
   LOCKED VERSION
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

  const topicId = root.getAttribute("data-topic-id");
  const minWriteTierAttr =
    root.getAttribute("data-min-write-tier") || "initiate";

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  const parentReplyField = document.getElementById("parent-reply-id");
  const replyContext = document.getElementById("reply-context");
  const replyContextSnippet =
    document.getElementById("reply-context-snippet");

  if (!messagesEl) return;

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  const reputationSubscriptions = new Map();
  const voteSubscriptions = new Map();

  /* -----------------------------------------------------------
     Utilities
     ----------------------------------------------------------- */
  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toLocalTime(ts) {
    try {
      const d = ts?.toDate?.();
      return d ? d.toLocaleString() : "Pending timestamp";
    } catch {
      return "Pending timestamp";
    }
  }

  function createdSeconds(data) {
    return Number(data?.createdAt?.seconds || 0);
  }

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
      if (el && el.tagName !== "P") el.disabled = !enabled;
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
    const badge = badgeFor(extractScore(repData));
    document
      .querySelectorAll(
        `.discussion-message[data-user-id="${userId}"]
         .discussion-message-author`
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
    if (!userId || reputationSubscriptions.has(userId)) return;
    if (!currentUser && !isAdmin) return;
    if (currentUser && currentUser.uid !== userId && !isAdmin) return;

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
     Firestore listener (flat threads)
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

    const byId = new Map(replies.map(r => [r.id, r]));

    function depthOf(r) {
      let d = 0, p = r.data.parentReplyId;
      while (p) {
        const pr = byId.get(p);
        if (!pr) break;
        d++;
        p = pr.data.parentReplyId;
      }
      return d;
    }

    function rootOf(r) {
      let root = r.id, p = r.data.parentReplyId;
      while (p) {
        const pr = byId.get(p);
        if (!pr) break;
        root = pr.id;
        p = pr.data.parentReplyId;
      }
      return root;
    }

    replies.forEach(r => {
      r.depth = depthOf(r);
      r.rootId = rootOf(r);
      if (r.data.userId) ensureReputationSubscription(r.data.userId);
    });

    const cardById = new Map(
      replies.map(r => [r.id, buildReplyCard(r.id, r.data, r.depth)])
    );

    const threads = new Map();
    replies.forEach(r => {
      if (!threads.has(r.rootId)) threads.set(r.rootId, []);
      threads.get(r.rootId).push(r);
    });

    Array.from(threads.entries())
      .sort((a, b) =>
        createdSeconds(byId.get(a[0])?.data) -
        createdSeconds(byId.get(b[0])?.data)
      )
      .forEach(([rootId, items]) => {
        const wrap = document.createElement("div");
        wrap.className = "discussion-thread-group";
        wrap.dataset.rootId = rootId;

        items
          .sort((a, b) =>
            a.depth !== b.depth
              ? a.depth - b.depth
              : createdSeconds(a.data) - createdSeconds(b.data)
          )
          .forEach(r => {
            const card = cardById.get(r.id);
            wrap.appendChild(card);
            setupVotes(topicId, r.id, card);
          });

        messagesEl.appendChild(wrap);
      });

    applyMobileCollapse();
  });

  /* -----------------------------------------------------------
     Voting
     ----------------------------------------------------------- */
  function setupVotes(topicIdArg, replyId, card) {
    if (voteSubscriptions.has(replyId)) return;

    const ref = collection(
      db, "topics", topicIdArg, "replies", replyId, "votes"
    );

    const unsub = onSnapshot(ref, snap => {
      const counts = { insight: 0, agree: 0, challenge: 0 };
      let userVote = null;

      snap.forEach(s => {
        const v = s.data();
        if (counts[v.type] != null) counts[v.type]++;
        if (currentUser && s.id === currentUser.uid) userVote = v.type;
      });

      Object.entries(counts).forEach(([t, c]) => {
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

    voteSubscriptions.set(replyId, unsub);
  }

  async function toggleVote(topicIdArg, replyId, voteType) {
    if (!currentUser) return;

    const replyRef = doc(db, "topics", topicIdArg, "replies", replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;

    const author = replySnap.data().userId;

    const voteRef = doc(
      db, "topics", topicIdArg, "replies", replyId,
      "votes", currentUser.uid
    );

    const snap = await getDoc(voteRef);
    const prev = snap.exists() ? snap.data().type : null;

    const pts = { insight: 3, agree: 1, challenge: 1 };
    let delta = 0;

    if (prev === voteType) {
      await deleteDoc(voteRef);
      delta = -pts[voteType];
    } else {
      await setDoc(voteRef, {
        type: voteType,
        createdAt: serverTimestamp()
      });
      delta = pts[voteType] - (pts[prev] || 0);
    }

    if (delta && author) {
      Reputation.awardPoints(
        author, delta, "vote",
        `Vote ${voteType}`, topicIdArg
      ).catch(() => {});
    }
  }

  /* -----------------------------------------------------------
     Animations (guarded)
     ----------------------------------------------------------- */
  function spawnRipple(btn, x, y) {
    if (!btn || typeof x !== "number" || typeof y !== "number") return;
    const r = document.createElement("span");
    r.className = "vote-ripple";
    const rect = btn.getBoundingClientRect();
    r.style.left = `${x - rect.left - 7}px`;
    r.style.top = `${y - rect.top - 7}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 450);
  }

  function spawnInsightParticles(btn) {
    if (!btn || window.innerWidth <= 768) return;
    const p = document.createElement("span");
    p.className = "insight-particle";
    p.textContent = ["✧", "☉", "X"][Math.floor(Math.random() * 3)];
    btn.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }

  /* -----------------------------------------------------------
     Mobile collapse
     ----------------------------------------------------------- */
  function applyMobileCollapse() {
    if (window.innerWidth > 768) return;

    document.querySelectorAll(".discussion-thread-group").forEach(g => {
      const deep = [...g.querySelectorAll(".discussion-message")]
        .filter(c => Number(c.dataset.depth) >= 3);
      if (!deep.length) return;

      deep.forEach(c => c.classList.add("is-collapsed"));

      let t = g.querySelector(".reply-collapse-toggle");
      if (!t) {
        t = document.createElement("button");
        t.className = "reply-collapse-toggle";
        t.type = "button";
        g.prepend(t);
      }
      t.textContent = `View ${deep.length} replies`;
    });
  }

  /* -----------------------------------------------------------
     Unified click handler
     ----------------------------------------------------------- */
  async function handleAction(e) {
    const t = e.target.closest(".vote-btn");
    if (t) {
      const replyId = t.dataset.replyId;
      const voteType = t.dataset.voteType;
      if (!replyId || !voteType) return;

      await toggleVote(topicId, replyId, voteType);

      if (e.clientX && e.clientY) {
        spawnRipple(t, e.clientX, e.clientY);
      }
      if (voteType === "insight") spawnInsightParticles(t);
    }
  }

  document.addEventListener("click", handleAction, { passive: true });
  document.addEventListener("pointerup", handleAction, { passive: true });

});

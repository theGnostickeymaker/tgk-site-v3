/* =============================================================
   TGK Community, Topic Engine v3.8
   Fix: Root posts must use intent="comment" to satisfy rules
   Fix: Vote counts + active state survive re-render (cached per reply, then applied on rebuild)
   Adds: Remembers user vote per reply and preselects reply type on Reply
   Adds: Locks composer select for root vs reply modes
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

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { Reputation } from "./reputation.js";

document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------------------------------------
     Core DOM references
  ----------------------------------------------------------- */
  const root = document.getElementById("discussion-root");
  if (!root) return;

  const topicId = root.getAttribute("data-topic-id");
  if (!topicId) return;

  const minWriteTierAttr = root.getAttribute("data-min-write-tier") || "initiate";

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  const parentReplyField = document.getElementById("parent-reply-id");
  const replyContext = document.getElementById("reply-context");
  const replyContextSnippet = document.getElementById("reply-context-snippet");

  // Composer fields
  const steelField = form?.querySelector("#steelman-summary") || null;
  const steelWrap = document.getElementById("steelman-field-wrap");
  const bodyField = form?.querySelector("#reply-body") || null;
  const pseudoField = form?.querySelector("#pseudonym") || null;
  const intentField = form?.querySelector("#reply-intent") || null;

  if (!messagesEl) return;

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;
  let pendingScrollToReplyId = null; // set after post, consumed after next render

  const reputationSubscriptions = new Map(); // userId -> unsub
  const voteSubscriptions = new Map(); // replyId -> unsub

  // Keeps the user's current vote per reply (synced by votes snapshot)
  const lastVoteByReply = new Map(); // replyId -> "insight"|"agree"|"challenge"

  // Critical fix: cache vote state so rebuilt DOM can be immediately hydrated
  const voteStateByReply = new Map(); // replyId -> { counts: {..}, userVote: string|null }

  /* -----------------------------------------------------------
     Composer rules
  ----------------------------------------------------------- */
  const RULES = {
    steelMinWords: 10,
    steelMaxWords: 40,
    normalMinChars: 10,
    challengeMinChars: 40
  };

  function wordCount(str) {
    return String(str || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function charCount(str) {
    return String(str || "").trim().length;
  }

  function getParentId() {
    return (parentReplyField?.value || "").trim() || null;
  }

  function getIntentRaw() {
    return (intentField?.value || "comment").trim();
  }

  function setIntent(value) {
    if (!intentField) return;
    intentField.value = value;
  }

  function isRootComposer() {
    return !getParentId();
  }

  function normaliseIntentForComposer() {
    // Root posts must be "comment" to satisfy rules
    if (isRootComposer()) {
      if (getIntentRaw() !== "comment") setIntent("comment");
      return "comment";
    }

    // Replies must not be "comment"
    const i = getIntentRaw();
    if (i === "comment") {
      setIntent("reply");
      return "reply";
    }
    return i;
  }

  function lockComposerOptions(isReply) {
    if (!intentField) return;

    const options = Array.from(intentField.querySelectorAll("option"));
    const byValue = new Map(options.map(o => [o.value, o]));

    const commentOpt = byValue.get("comment");
    const replyOpt = byValue.get("reply");
    const agreeOpt = byValue.get("agree");
    const insightOpt = byValue.get("insight");
    const challengeOpt = byValue.get("challenge");

    if (!isReply) {
      // Root composer: comment only
      if (commentOpt) commentOpt.disabled = false;
      if (replyOpt) replyOpt.disabled = true;
      if (agreeOpt) agreeOpt.disabled = true;
      if (insightOpt) insightOpt.disabled = true;
      if (challengeOpt) challengeOpt.disabled = true;

      setIntent("comment");
    } else {
      // Reply composer: everything except comment
      if (commentOpt) commentOpt.disabled = true;
      if (replyOpt) replyOpt.disabled = false;
      if (agreeOpt) agreeOpt.disabled = false;
      if (insightOpt) insightOpt.disabled = false;
      if (challengeOpt) challengeOpt.disabled = false;

      if (getIntentRaw() === "comment") setIntent("reply");
    }
  }

  function updateComposerUI() {
    if (!form) return;

    const isReply = Boolean(getParentId());
    lockComposerOptions(isReply);

    const intent = normaliseIntentForComposer();
    const needsSteel = isReply && intent === "challenge";

    if (steelWrap) steelWrap.hidden = !needsSteel;
    if (steelField) steelField.required = needsSteel;

    if (bodyField) bodyField.required = true;

    if (statusEl) {
      if (!isReply) {
        statusEl.textContent = "Posting a new comment. Keep it concise and clear.";
      } else if (needsSteel) {
        statusEl.textContent = "Challenge reply: Steel Man required.";
      } else {
        statusEl.textContent = "Replying in thread.";
      }
    }
  }

  /* -----------------------------------------------------------
     Small utilities
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
  }function getComposerHost() {
  return document.getElementById("add") || document.getElementById("add-reply");
}

function openComposer() {
  const host = getComposerHost();
  const details = host?.querySelector("details");
  if (details) details.open = true;

  requestAnimationFrame(() => {
    (host || form)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function closeComposer() {
  const host = getComposerHost();
  const details = host?.querySelector("details");
  if (details) details.open = false;
}


  /* -----------------------------------------------------------
     Tier helpers
  ----------------------------------------------------------- */
  function tierRank(tier) {
    switch (tier) {
      case "initiate": return 1;
      case "adept": return 2;
      case "admin": return 3;
      default: return 0;
    }
  }

  function minTierSatisfied() {
    return tierRank(currentTier) >= tierRank(minWriteTierAttr);
  }

  function setFormEnabled(enabled, message) {
    if (!form) return;

    if (enabled) {
      form.classList.remove("is-disabled");
      Array.from(form.elements).forEach(el => { el.disabled = false; });
    } else {
      form.classList.add("is-disabled");
      Array.from(form.elements).forEach(el => {
        if (el && el.tagName !== "P") el.disabled = true;
      });
    }

    if (authHintEl && message) authHintEl.textContent = message;
  }

  /* -----------------------------------------------------------
     Reputation badge helpers
  ----------------------------------------------------------- */
  function keysRank(score) {
    if (score >= 500) return "Guardian";
    if (score >= 200) return "Keeper";
    if (score >= 50) return "Initiate";
    if (score >= 1) return "Seeker";
    return "Observer";
  }

  function badgeFor(score) {
    if (!score || score < 1) return "";
    if (score >= 500) return "🜂";
    if (score >= 200) return "⟆";
    if (score >= 50) return "✦";
    return "✧";
  }

  function extractScore(repData) {
    if (!repData || typeof repData !== "object") return 0;
    if (typeof repData.total === "number") return repData.total;
    if (typeof repData.score === "number") return repData.score;
    return 0;
  }

  function updateAuthorBadges(userId, repData) {
    const score = extractScore(repData);
    const badge = badgeFor(score);
    const rank = keysRank(score);

    const authorEls = document.querySelectorAll(
      `.discussion-message[data-user-id="${userId}"] .discussion-message-author`
    );

    authorEls.forEach(el => {
      const existingBase = el.dataset.baseName;
      let baseName = existingBase;

      if (!baseName) {
        const raw = el.textContent || "";
        baseName = raw.replace(/[🜂⟆✦✧]/g, "").trim();
        el.dataset.baseName = baseName;
      }

      el.textContent = badge ? `${baseName} ${badge}` : baseName;

      if (rank && score > 0) {
        el.title = `Keys rank: ${rank} (${score} Keys)`;
      } else {
        el.removeAttribute("title");
      }
    });
  }

  function canReadReputation(targetUserId) {
    if (!currentUser) return false;
    if (isAdmin) return true;
    return currentUser.uid === targetUserId;
  }

  function ensureReputationSubscription(userId) {
    if (!userId) return;
    if (reputationSubscriptions.has(userId)) return;
    if (!canReadReputation(userId)) return;

    const repRef = doc(db, "reputation", userId);

    const unsub = onSnapshot(
      repRef,
      snap => {
        const repData = snap.exists() ? snap.data() : null;
        updateAuthorBadges(userId, repData);
      },
      error => {
        console.warn("[Reputation] Snapshot error:", error);
      }
    );

    reputationSubscriptions.set(userId, unsub);
  }

  /* -----------------------------------------------------------
     Auth tracking
  ----------------------------------------------------------- */
  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    currentTier = "free";
    isAdmin = false;

    if (!user) {
      setFormEnabled(false, "You are currently signed out. Sign in to join the discussion.");
      return;
    }

    try {
      const tokenResult = await user.getIdTokenResult();
      currentTier = tokenResult.claims.tier || "free";
      isAdmin = tokenResult.claims.tier === "admin" || tokenResult.claims.role === "admin";
    } catch (err) {
      console.error("Unable to read user tier from claims:", err);
      currentTier = "free";
      isAdmin = false;
    }

    if (!minTierSatisfied()) {
      setFormEnabled(false, `Upgrade to “${minWriteTierAttr}” to contribute.`);
      return;
    }

    setFormEnabled(true, "You are signed in. Your contribution will appear with your chosen pseudonym.");
    updateComposerUI();
  });

  /* -----------------------------------------------------------
     Vote UI hydration (critical for surviving re-render)
  ----------------------------------------------------------- */
  function getCachedVoteState(replyId) {
  const cached = voteStateByReply.get(replyId);
  if (cached && cached.counts) return cached;
  return { counts: { insight: 0, agree: 0, challenge: 0 }, userVote: null, ready: false };
}

function applyVoteStateToCard(replyId, card) {
  if (!card) return;

  const state = getCachedVoteState(replyId);
  const voteGroup = card.querySelector(`.vote-group[data-reply-id="${replyId}"]`);

  if (voteGroup) {
    voteGroup.classList.toggle("is-loading", !state.ready);
  }

  // If not ready, show ellipsis placeholders
  if (!state.ready) {
    ["insight", "agree", "challenge"].forEach(type => {
      const el = card.querySelector(`.vote-count[data-count-type="${type}"]`);
      if (el) el.textContent = "…";
    });

    card.querySelectorAll(".vote-btn").forEach(btn => btn.classList.remove("is-voted"));
    return;
  }

  // Ready: show real counts and active state
  Object.entries(state.counts).forEach(([type, count]) => {
    const el = card.querySelector(`.vote-count[data-count-type="${type}"]`);
    if (el) el.textContent = String(count);
  });

  card.querySelectorAll(".vote-btn").forEach(btn => {
    btn.classList.toggle("is-voted", btn.dataset.voteType === state.userVote);
  });
}

  /* -----------------------------------------------------------
     Flat thread rendering (grouped by root comment)
  ----------------------------------------------------------- */
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, (snapshot) => {
    messagesEl.innerHTML = "";

    if (snapshot.empty) {
      messagesEl.innerHTML = `
        <p class="muted small">
          No contributions yet. Be the first to start the discussion.
        </p>
      `;
      return;
    }

    const allReplies = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      data: docSnap.data()
    }));

    const byId = new Map(allReplies.map(r => [r.id, r]));

    function getDepth(reply) {
      let depth = 0;
      let parent = reply.data.parentReplyId;

      while (parent) {
        const p = byId.get(parent);
        if (!p) break;
        depth += 1;
        parent = p.data.parentReplyId;
      }
      return depth;
    }

    function getRootId(reply) {
      let rootId = reply.id;
      let parent = reply.data.parentReplyId;

      while (parent) {
        const p = byId.get(parent);
        if (!p) break;
        rootId = p.id;
        parent = p.data.parentReplyId;
      }
      return rootId;
    }

    allReplies.forEach(r => {
      r.depth = getDepth(r);
      r.rootId = getRootId(r);
      if (r.data.userId) ensureReputationSubscription(r.data.userId);
    });

    const cardById = new Map();
    allReplies.forEach(r => {
      const card = buildReplyCard(r.id, r.data, r.depth);
      cardById.set(r.id, card);

      // Critical: hydrate vote counts and active state from cache immediately
      applyVoteStateToCard(r.id, card);
    });

    const threads = new Map();
    allReplies.forEach(r => {
      if (!threads.has(r.rootId)) threads.set(r.rootId, []);
      threads.get(r.rootId).push(r);
    });

    const threadEntries = Array.from(threads.entries()).map(([rootId, items]) => {
      const rootReply = byId.get(rootId);
      const pinned = Boolean(rootReply?.data?.pinned);
      const rootTime = createdSeconds(rootReply?.data);
      return { rootId, items, pinned, rootTime };
    });

    threadEntries.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.rootTime - b.rootTime;
    });

    threadEntries.forEach(({ rootId, items }) => {
      const threadWrap = document.createElement("div");
      threadWrap.className = "discussion-thread-group";
      threadWrap.dataset.rootId = rootId;

      items
        .sort((a, b) => {
          if (a.depth !== b.depth) return a.depth - b.depth;
          return createdSeconds(a.data) - createdSeconds(b.data);
        })
        .forEach(r => {
          const card = cardById.get(r.id);
          if (!card) return;

          threadWrap.appendChild(card);

          // Keep vote listeners alive; they will update cache and DOM when they fire
          if (!r.data.deleted) setupVotes(topicId, r.id);
        });

      messagesEl.appendChild(threadWrap);
    });

    applyMobileCollapse();

    // After render: jump to the newly created reply (if any)
    if (pendingScrollToReplyId) {
      const id = pendingScrollToReplyId;
      pendingScrollToReplyId = null;

      // Ensure it is visible even on mobile collapse
      const el = document.getElementById(`comment-${id}`);
      if (el) {
        el.classList.remove("is-collapsed");

        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("just-posted");

        window.setTimeout(() => el.classList.remove("just-posted"), 1400);
      }
    }
  });

  /* -----------------------------------------------------------
     Build a reply card
  ----------------------------------------------------------- */
  function intentLabel(data) {
    const i = String(data?.intent || "").trim();
    if (i === "insight") return "Insight";
    if (i === "agree") return "Agree";
    if (i === "challenge") return "Challenge";
    if (i === "reply") return "Reply";
    return "Comment";
  }

  function buildReplyCard(replyId, data, depth) {
    const card = document.createElement("article");
    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.id = `comment-${replyId}`;
    card.dataset.depth = String(depth ?? 0);

    if (data.userId) card.dataset.userId = data.userId;

    if (data.deleted) {
      card.classList.add("is-deleted");

      const tombstone = document.createElement("div");
      tombstone.className = "discussion-message-deleted";

      const who = (data.deletedBy && data.userId && data.deletedBy === data.userId)
        ? "by the author"
        : "by a moderator";

      tombstone.innerHTML = `<em>This contribution was removed ${who}.</em>`;

      if (isAdmin) {
        const restoreBtn = document.createElement("button");
        restoreBtn.type = "button";
        restoreBtn.className = "btn-link btn-restore-reply";
        restoreBtn.dataset.replyId = replyId;
        restoreBtn.textContent = "Restore";
        tombstone.appendChild(document.createElement("br"));
        tombstone.appendChild(restoreBtn);
      }

      card.appendChild(tombstone);
      return card;
    }

    if (data.pinned) card.classList.add("is-pinned");

    const header = document.createElement("div");
    header.className = "discussion-message-header";

    const author = document.createElement("span");
    author.className = "discussion-message-author";
    const pseudo = data.pseudonym || "Anonymous Seeker";
    author.dataset.baseName = pseudo;
    author.textContent = pseudo;

    const meta = document.createElement("span");
    meta.className = "discussion-message-meta";
    meta.textContent = toLocalTime(data.createdAt);

    const chip = document.createElement("span");
    chip.className = "reply-intent-chip";
    chip.dataset.intent = String(data.intent || "comment");
    chip.textContent = intentLabel(data);

    header.appendChild(author);
    header.appendChild(meta);
    header.appendChild(chip);

    const steelBlock = document.createElement("div");
    steelBlock.className = "discussion-message-steelman reply-steelman-body";

    if (data.steelmanSummary) {
      steelBlock.innerHTML = `
        <div class="steelman-label">Steel Man Summary</div>
        <div class="steelman-text">${escapeHtml(data.steelmanSummary)}</div>
      `;
    }

    const body = document.createElement("div");
    body.className = "discussion-message-body reply-body-text";
    body.textContent = data.body || "";

    const actions = document.createElement("div");
    actions.className = "discussion-actions";

    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "btn-link btn-reply-comment";
    replyBtn.dataset.replyId = replyId;
    replyBtn.dataset.snippet = (data.steelmanSummary || data.body || "").slice(0, 120);
    replyBtn.textContent = "Reply";
    actions.appendChild(replyBtn);

    // Use cached vote state for initial render (prevents 0s after re-render)
    const cached = getCachedVoteState(replyId);
    const counts = cached.counts;
    const cInsight = cached.ready ? String(counts.insight) : "…";
    const cAgree = cached.ready ? String(counts.agree) : "…";
    const cChallenge = cached.ready ? String(counts.challenge) : "…";

    const voteGroup = document.createElement("div");
    voteGroup.className = "vote-group";
    voteGroup.dataset.replyId = replyId;
    voteGroup.innerHTML = `
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="insight" aria-label="Vote Insight">
        🜁 <span class="vote-label">Insight</span>
        <span class="vote-count" data-count-type="insight">${cInsight}</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="agree" aria-label="Vote Agree">
        ✦ <span class="vote-label">Agree</span>
        <span class="vote-count" data-count-type="agree">${cAgree}</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="challenge" aria-label="Vote Challenge">
        ⛧ <span class="vote-label">Challenge</span>
        <span class="vote-count" data-count-type="challenge">${cChallenge}</span>
      </button>
    `;

    if (!cached.ready) voteGroup.classList.add("is-loading");

    actions.appendChild(voteGroup);

    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-link btn-edit-reply";
      editBtn.dataset.replyId = replyId;
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);
    }

    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-link btn-delete-comment";
      delBtn.dataset.commentId = replyId;
      delBtn.dataset.topicId = topicId;
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);
    }

    if (isAdmin) {
      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className = "btn-link btn-pin-reply";
      pinBtn.dataset.replyId = replyId;
      pinBtn.textContent = data.pinned ? "Unpin" : "Pin";
      actions.appendChild(pinBtn);
    }

    card.appendChild(header);
    if (data.steelmanSummary) card.appendChild(steelBlock);
    card.appendChild(body);
    card.appendChild(actions);

    return card;
  }

    /* -----------------------------------------------------------
     Voting system (DOM-safe + cached)
  ----------------------------------------------------------- */
  function setupVotes(topicIdArg, replyId) {
    if (voteSubscriptions.has(replyId)) return;

    const votesRef = collection(db, "topics", topicIdArg, "replies", replyId, "votes");

    const unsub = onSnapshot(votesRef, (snapshot) => {
      const counts = { insight: 0, agree: 0, challenge: 0 };
      let userVote = null;

      snapshot.forEach((snap) => {
        const v = snap.data();
        if (v && v.type && counts[v.type] != null) counts[v.type] += 1;
        if (currentUser && snap.id === currentUser.uid && v && v.type) userVote = v.type;
      });

      // Cache state so rebuilt DOM can be hydrated instantly
      voteStateByReply.set(replyId, { counts, userVote, ready: true });

      // Keep last vote per reply in sync for the reply composer preselect
      if (userVote) lastVoteByReply.set(replyId, userVote);
      else lastVoteByReply.delete(replyId);

      // Live update current DOM if present
      const liveCard = document.getElementById(`comment-${replyId}`);
      if (liveCard) {
        // Optional: disable voting on own posts in the UI
        if (currentUser && liveCard.dataset.userId === currentUser.uid) {
          liveCard.querySelectorAll(".vote-btn").forEach((btn) => {
            btn.disabled = true;
            btn.classList.add("is-disabled");
            btn.setAttribute("aria-disabled", "true");
            btn.title = "You cannot vote on your own contribution.";
          });
        }

        applyVoteStateToCard(replyId, liveCard);
      }
    });

    voteSubscriptions.set(replyId, unsub);
  }

  async function toggleVote(topicIdArg, replyId, voteType) {
    if (!currentUser) {
      if (statusEl) statusEl.textContent = "You must be signed in to vote.";
      return;
    }

    const replyRef = doc(db, "topics", topicIdArg, "replies", replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;

    const replyData = replySnap.data() || {};

    if (replyData.deleted) {
      if (statusEl) statusEl.textContent = "You cannot vote on a removed contribution.";
      return;
    }

    const replyAuthor = replyData.userId || null;

    // Block self-voting (UX guard)
    if (replyAuthor && currentUser.uid === replyAuthor) {
      if (statusEl) statusEl.textContent = "You cannot vote on your own contribution.";
      return;
    }

    const voteRef = doc(db, "topics", topicIdArg, "replies", replyId, "votes", currentUser.uid);
    const voteSnap = await getDoc(voteRef);
    const prevType = voteSnap.exists() ? voteSnap.data().type : null;

    const pts = { insight: 3, agree: 1, challenge: 1 };
    let delta = 0;

    if (prevType === voteType) {
      await deleteDoc(voteRef);
      delta = -pts[voteType];
    } else if (!prevType) {
      await setDoc(voteRef, { type: voteType, createdAt: serverTimestamp() });
      delta = pts[voteType];
    } else {
      await setDoc(voteRef, { type: voteType, createdAt: serverTimestamp() });
      delta = pts[voteType] - pts[prevType];
    }

    if (delta !== 0 && replyAuthor) {
      try {
        await Reputation.awardPoints(
          replyAuthor,
          delta,
          "vote",
          `Vote ${voteType} on reply ${replyId}`,
          topicIdArg
        );
      } catch (err) {
        console.error("[Reputation] vote award failed:", err);
      }
    }
  }


  /* -----------------------------------------------------------
     Voting animations
  ----------------------------------------------------------- */
  function spawnRipple(btn, x, y) {
    const ripple = document.createElement("span");
    ripple.className = "vote-ripple";

    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${x - rect.left - 7}px`;
    ripple.style.top = `${y - rect.top - 7}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 450);
  }

  function spawnInsightParticles(btn) {
    const symbols = ["✧", "☉", "X"];
    const chosen = symbols[Math.floor(Math.random() * symbols.length)];

    const particle = document.createElement("span");
    particle.className = "insight-particle";
    particle.textContent = chosen;

    const rect = btn.getBoundingClientRect();
    particle.style.left = `${rect.width / 2 - 4}px`;
    particle.style.top = "0px";

    btn.appendChild(particle);
    setTimeout(() => particle.remove(), 750);
  }

  /* -----------------------------------------------------------
     Mobile collapse (flat threads)
  ----------------------------------------------------------- */
  function applyMobileCollapse() {
    if (window.innerWidth > 768) {
      document.querySelectorAll(".discussion-thread-group").forEach(group => {
        group.querySelectorAll(".discussion-message.is-collapsed").forEach(c => {
          c.classList.remove("is-collapsed");
        });
        const toggle = group.querySelector(".reply-collapse-toggle");
        if (toggle) toggle.remove();
      });
      return;
    }

    document.querySelectorAll(".discussion-thread-group").forEach(group => {
      const cards = Array.from(group.querySelectorAll(".discussion-message"));
      const deepCards = cards.filter(c => Number(c.dataset.depth || 0) >= 3);
      if (deepCards.length === 0) return;

      deepCards.forEach(c => c.classList.add("is-collapsed"));

      let toggle = group.querySelector(".reply-collapse-toggle");
      if (!toggle) {
        toggle = document.createElement("button");
        toggle.className = "reply-collapse-toggle";
        toggle.type = "button";
        toggle.textContent = `View ${deepCards.length} replies`;
        toggle.setAttribute("aria-expanded", "false");
        group.prepend(toggle);
      } else {
        toggle.textContent = `View ${deepCards.length} replies`;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  window.addEventListener("resize", () => {
    clearTimeout(window.__tgk_discussion_resize);
    window.__tgk_discussion_resize = setTimeout(() => applyMobileCollapse(), 120);
  });

  /* -----------------------------------------------------------
     Click handlers (reply, vote, pin, delete, collapse)
  ----------------------------------------------------------- */
  async function handleActionEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    /* -----------------------------------------
       VOTING
    ----------------------------------------- */
    const voteBtn = target.closest(".vote-btn");
    if (voteBtn) {
      event.preventDefault();

      const replyId = voteBtn.dataset.replyId;
      const voteType = voteBtn.dataset.voteType;
      if (!replyId || !voteType) return;

      spawnRipple(voteBtn, event.clientX || 0, event.clientY || 0);
      if (voteType === "insight") spawnInsightParticles(voteBtn);

      try {
        await toggleVote(topicId, replyId, voteType);
      } catch (err) {
        console.error("[Vote] Error:", err);
        if (statusEl) statusEl.textContent = "Unable to register vote.";
      }
      return;
    }

    /* -----------------------------------------
       REPLY BUTTON
    ----------------------------------------- */
    const replyBtn = target.closest(".btn-reply-comment");
    if (replyBtn) {
      const replyId = replyBtn.dataset.replyId;
      const snippet = replyBtn.dataset.snippet || "";
      if (!replyId) return;

      if (parentReplyField) parentReplyField.value = replyId;
      if (replyContextSnippet) replyContextSnippet.textContent = snippet;
      if (replyContext) replyContext.hidden = false;

      // Preselect reply type based on the user's current vote for this reply
      const remembered = lastVoteByReply.get(replyId);
      setIntent(remembered || "reply");

      updateComposerUI();

      openComposer();
      return;
    }

    /* -----------------------------------------
       CANCEL REPLY CONTEXT
    ----------------------------------------- */
    if (target.id === "cancel-reply-context") {
      if (parentReplyField) parentReplyField.value = "";
      if (replyContext) replyContext.hidden = true;

      setIntent("comment");
      updateComposerUI();
      return;
    }

    /* -----------------------------------------
       DELETE / RESTORE / PIN / UNPIN / COLLAPSE
       (Your existing handlers below can stay as-is)
    ----------------------------------------- */

    const deleteBtn = target.closest(".btn-delete-comment");
    if (deleteBtn) {
      event.preventDefault();
      event.stopPropagation();

      const replyId = deleteBtn.dataset.commentId;
      const topicIdArg = deleteBtn.dataset.topicId || topicId;
      if (!replyId || !topicIdArg) return;

      if (!currentUser) {
        if (statusEl) statusEl.textContent = "You must be signed in to delete replies.";
        return;
      }

      try {
        const replyRef = doc(db, "topics", topicIdArg, "replies", replyId);
        const snap = await getDoc(replyRef);
        if (!snap.exists()) return;

        const data = snap.data();
        const isAuthor = data.userId === currentUser.uid;

        if (!isAuthor && !isAdmin) {
          if (statusEl) statusEl.textContent = "You do not have permission to delete this reply.";
          return;
        }

        const confirmed = window.confirm("Delete this reply? This action cannot be undone.");
        if (!confirmed) return;

        await setDoc(
          replyRef,
          {
            deleted: true,
            deletedAt: serverTimestamp(),
            deletedBy: currentUser.uid,
            deleteReason: isAdmin ? "moderator" : "author"
          },
          { merge: true }
        );

        if (isAdmin) {
          try {
            await addDoc(collection(db, "moderationLogs"), {
              action: "moderator_delete",
              topicId: topicIdArg,
              replyId,
              performedBy: currentUser.uid,
              targetUser: data.userId || "",
              reason: "moderator",
              createdAt: serverTimestamp()
            });
          } catch (logErr) {
            console.warn("[Moderation Log] Unable to write delete log:", logErr);
          }
        }

        const card = document.getElementById(`comment-${replyId}`);
        if (card) card.remove();

        if (statusEl) statusEl.textContent = "Reply deleted.";
      } catch (err) {
        console.error("[Delete Reply]", err);
        if (statusEl) statusEl.textContent = `Unable to delete reply. ${err?.message || ""}`.trim();
      }

      return;
    }

    const restoreBtn = target.closest(".btn-restore-reply");
    if (restoreBtn) {
      event.preventDefault();
      event.stopPropagation();

      if (!isAdmin) return;

      const replyId = restoreBtn.dataset.replyId;
      if (!replyId) return;

      try {
        const replyRef = doc(db, "topics", topicId, "replies", replyId);
        const snap = await getDoc(replyRef);
        if (!snap.exists()) return;

        const data = snap.data();

        await setDoc(
          replyRef,
          {
            deleted: false,
            deletedAt: null,
            deletedBy: null,
            deleteReason: null,
            restoredAt: serverTimestamp(),
            restoredBy: currentUser.uid
          },
          { merge: true }
        );

        try {
          await addDoc(collection(db, "moderationLogs"), {
            action: "restore",
            topicId,
            replyId,
            performedBy: currentUser.uid,
            targetUser: data.userId || "",
            reason: "restore",
            createdAt: serverTimestamp()
          });
        } catch (logErr) {
          console.warn("[Moderation Log] Unable to write restore log:", logErr);
        }

        if (statusEl) statusEl.textContent = "Reply restored.";
      } catch (err) {
        console.error("[Restore Reply]", err);
        if (statusEl) statusEl.textContent = `Unable to restore reply. ${err?.message || ""}`.trim();
      }

      return;
    }

    const pinBtn = target.closest(".btn-pin-reply");
    if (pinBtn) {
      event.preventDefault();
      event.stopPropagation();

      if (!isAdmin) return;

      const replyId = pinBtn.dataset.replyId;
      if (!replyId) return;

      const replyRef = doc(db, "topics", topicId, "replies", replyId);
      const snap = await getDoc(replyRef);
      if (!snap.exists()) return;

      const currentlyPinned = Boolean(snap.data().pinned);

      try {
        await setDoc(replyRef, { pinned: !currentlyPinned }, { merge: true });

        try {
          await addDoc(collection(db, "moderationLogs"), {
            action: currentlyPinned ? "unpin" : "pin",
            topicId,
            replyId,
            performedBy: currentUser.uid,
            targetUser: snap.data().userId || "",
            reason: currentlyPinned ? "unpin" : "pin",
            createdAt: serverTimestamp()
          });
        } catch (logErr) {
          console.warn("[Moderation Log] Unable to write pin log:", logErr);
        }

        if (statusEl) statusEl.textContent = currentlyPinned ? "Unpinned reply." : "Pinned reply.";
      } catch (err) {
        console.error("[Pin Reply]", err);
        if (statusEl) statusEl.textContent = `Unable to update pin. ${err?.message || ""}`.trim();
      }

      return;
    }

    const collapseToggle = target.closest(".reply-collapse-toggle");
    if (collapseToggle) {
      const group = collapseToggle.closest(".discussion-thread-group");
      if (!group) return;

      const cards = Array.from(group.querySelectorAll(".discussion-message"));
      const deepCards = cards.filter(c => Number(c.dataset.depth || 0) >= 3);
      if (!deepCards.length) return;

      const collapsed = deepCards.some(c => c.classList.contains("is-collapsed"));
      deepCards.forEach(c => c.classList.toggle("is-collapsed", !collapsed));

      collapseToggle.textContent = collapsed ? "Hide replies" : `View ${deepCards.length} replies`;
      collapseToggle.setAttribute("aria-expanded", String(collapsed));
      return;
    }
  }

  document.addEventListener("pointerup", handleActionEvent, { passive: false });

  if (intentField) {
    intentField.addEventListener("change", () => updateComposerUI());
  }

  // Initial UI state: root comment mode
  setIntent("comment");
  updateComposerUI();

  /* -----------------------------------------------------------
     Submit handler
  ----------------------------------------------------------- */
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!currentUser) {
        if (statusEl) statusEl.textContent = "You must be signed in to post.";
        return;
      }

      if (!minTierSatisfied()) {
        if (statusEl) statusEl.textContent = `Your tier (“${currentTier}”) is not sufficient to post here.`;
        return;
      }

      const steel = (steelField?.value || "").trim();
      const body = (bodyField?.value || "").trim();
      const pseudo = (pseudoField?.value || "").trim() || "Anonymous Seeker";

      const parentId = getParentId();
      const isReply = Boolean(parentId);

      // Root posts must always be comment
      const intent = isReply ? normaliseIntentForComposer() : "comment";
      if (!isReply) setIntent("comment");

      const isChallengeReply = isReply && intent === "challenge";

      if (!body) {
        if (statusEl) statusEl.textContent = "Please write something before posting.";
        return;
      }

      if (isChallengeReply) {
        if (charCount(body) < RULES.challengeMinChars) {
          if (statusEl) statusEl.textContent = `Challenge replies must be at least ${RULES.challengeMinChars} characters.`;
          return;
        }

        const wc = wordCount(steel);
        if (wc < RULES.steelMinWords || wc > RULES.steelMaxWords) {
          if (statusEl) statusEl.textContent =
            `Steel Man is required for Challenge replies and must be ${RULES.steelMinWords} to ${RULES.steelMaxWords} words.`;
          return;
        }
      } else {
        if (charCount(body) < RULES.normalMinChars) {
          if (statusEl) statusEl.textContent = `Please write at least ${RULES.normalMinChars} characters.`;
          return;
        }
      }

      if (statusEl) statusEl.textContent = "Posting...";

      try {
        const docRef = await addDoc(repliesRef, {
          userId: currentUser.uid,
          pseudonym: pseudo,
          steelmanSummary: steel || "",
          body,
          intent,
          createdAt: serverTimestamp(),
          parentReplyId: parentId, // null for root posts
          pinned: false,
          deleted: false
        });

        // Tell the next render to scroll to this new reply
        pendingScrollToReplyId = docRef.id;

        Reputation.awardPoints(
          currentUser.uid,
          1,
          "reply",
          `Reply posted in topic ${topicId}`,
          topicId
        ).catch(() => {});

        // Reset back to root comment mode
        form.reset();
        if (parentReplyField) parentReplyField.value = "";
        if (replyContext) replyContext.hidden = true;

        setIntent("comment");
        updateComposerUI();

        // Close the composer panel
        closeComposer();

        if (statusEl) statusEl.textContent = "Posted.";

      } catch (err) {
        console.error("[Post Error]", err);
        if (statusEl) statusEl.textContent =
          `There was a problem posting. ${err?.message || ""}`.trim();
      }
    });
  }
});

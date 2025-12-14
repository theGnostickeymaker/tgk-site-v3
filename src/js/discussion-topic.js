/* =============================================================
   TGK Community — Topic Engine v3.6 (Reddit-style Flat Threads)
   • Flat thread rendering grouped by root comment (no nested DOM)
   • Depth-indentation via data-depth (CSS)
   • Voting (Insight / Agree / Challenge) with ripple + particles
   • Pin / unpin (admin)
   • Reputation hooks + live badges
   • Reply-context preview when replying
   • Mobile auto-collapse for deep replies (depth >= 3) per thread
   • Safe rendering + guards
   ============================================================= */

import { auth, db } from "/js/firebase-init.js";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
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

  if (!messagesEl) return;

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  const reputationSubscriptions = new Map(); // userId -> unsub
  const voteSubscriptions = new Map(); // replyId -> unsub

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
  });

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
          No contributions yet. Be the first to offer a Steel Man summary.
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

    // Build cards once
    const cardById = new Map();
    allReplies.forEach(r => {
      cardById.set(r.id, buildReplyCard(r.id, r.data, r.depth));
    });

    // Group into thread buckets
    const threads = new Map(); // rootId -> reply[]
    allReplies.forEach(r => {
      if (!threads.has(r.rootId)) threads.set(r.rootId, []);
      threads.get(r.rootId).push(r);
    });

    // Stable ordering: pinned threads first (if the root comment is pinned)
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

    // Render
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
          setupVotes(topicId, r.id, card);
        });

      messagesEl.appendChild(threadWrap);
    });

    // Apply mobile collapse after render
    applyMobileCollapse();
  });

  /* -----------------------------------------------------------
     Build a reply card
     ----------------------------------------------------------- */
  function buildReplyCard(replyId, data, depth) {
  const card = document.createElement("article");
  card.className = "discussion-message";
  card.dataset.replyId = replyId;
  card.id = `comment-${replyId}`;
  card.dataset.depth = String(depth ?? 0);

  if (data.deleted) {
    const tombstone = document.createElement("div");
    tombstone.className = "discussion-message-deleted";

    tombstone.innerHTML = `
      <em>
        This contribution was removed
        ${data.deletedBy === data.userId ? "by the author" : "by a moderator"}.
      </em>
    `;

    card.appendChild(tombstone);
    return card;
  }

    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.id = `comment-${replyId}`;
    card.dataset.depth = String(depth ?? 0);

    if (data.userId) card.dataset.userId = data.userId;
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

    header.appendChild(author);
    header.appendChild(meta);

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

    const voteGroup = document.createElement("div");
    voteGroup.className = "vote-group";
    voteGroup.dataset.replyId = replyId;
    voteGroup.innerHTML = `
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="insight" aria-label="Vote Insight">
        🜁 <span class="vote-label">Insight</span>
        <span class="vote-count" data-count-type="insight">0</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="agree" aria-label="Vote Agree">
        ✦ <span class="vote-label">Agree</span>
        <span class="vote-count" data-count-type="agree">0</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="challenge" aria-label="Vote Challenge">
        ⛧ <span class="vote-label">Challenge</span>
        <span class="vote-count" data-count-type="challenge">0</span>
      </button>
    `;
    actions.appendChild(voteGroup);

    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-link btn-edit-reply";
      editBtn.dataset.replyId = replyId;
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);
    }

    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-link btn-delete-comment";
      delBtn.dataset.commentId = replyId;
      delBtn.dataset.topicId = topicId;
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);

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
     Voting system
     ----------------------------------------------------------- */
  function setupVotes(topicIdArg, replyId, card) {
    if (voteSubscriptions.has(replyId)) return;

    const votesRef = collection(
      db,
      "topics",
      topicIdArg,
      "replies",
      replyId,
      "votes"
    );

    const unsub = onSnapshot(votesRef, (snapshot) => {
      const counts = { insight: 0, agree: 0, challenge: 0 };
      let userVote = null;

      snapshot.forEach((snap) => {
        const v = snap.data();
        if (v && v.type && counts[v.type] != null) {
          counts[v.type] = (counts[v.type] || 0) + 1;
        }
        if (currentUser && snap.id === currentUser.uid && v && v.type) {
          userVote = v.type;
        }
      });

      Object.entries(counts).forEach(([type, count]) => {
        const el = card.querySelector(`.vote-count[data-count-type="${type}"]`);
        if (el) el.textContent = String(count);
      });

      card.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.voteType === userVote);
      });
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

    const replyAuthor = replySnap.data().userId;

    const voteRef = doc(
      db,
      "topics",
      topicIdArg,
      "replies",
      replyId,
      "votes",
      currentUser.uid
    );

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
     - Collapses cards within each thread group where depth >= 3
     - Adds a single toggle per thread group
     ----------------------------------------------------------- */
  function applyMobileCollapse() {
    if (window.innerWidth > 768) {
      // On desktop, ensure everything is visible and remove toggles
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

      // Collapse deep cards by default on mobile
      deepCards.forEach(c => c.classList.add("is-collapsed"));

      // Ensure exactly one toggle per group
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
    // Light debounce for resize
    clearTimeout(window.__tgk_discussion_resize);
    window.__tgk_discussion_resize = setTimeout(() => applyMobileCollapse(), 120);
  });

  /* -----------------------------------------------------------
    Click handlers (reply, vote, pin, delete, thread collapse)
    Single delegated handler, mobile-safe
  ----------------------------------------------------------- */
  async function handleActionEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    // 🔒 Prevent double-fire (touch → pointerup + click)
    if (event.type === "click" && event.pointerType === "touch") return;

    /* -----------------------------------------
      DELETE REPLY (author or admin)
    ----------------------------------------- */
    const deleteBtn = target.closest(".btn-delete-comment");
    if (deleteBtn) {
      event.preventDefault();
      event.stopPropagation();

      const replyId = deleteBtn.dataset.commentId;
      const topicIdArg = deleteBtn.dataset.topicId;

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

        const confirmed = window.confirm(
          "Delete this reply? This action cannot be undone."
        );
        if (!confirmed) return;

        // Delete votes first
        const votesRef = collection(
          db,
          "topics",
          topicIdArg,
          "replies",
          replyId,
          "votes"
        );

        // Delete reply
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

        const card = document.getElementById(`comment-${replyId}`);
        if (card) card.remove();


        if (statusEl) statusEl.textContent = "Reply deleted.";

      } catch (err) {
        console.error("[Delete Reply]", err);
        if (statusEl) statusEl.textContent = "Unable to delete reply.";
      }

      return;
    }

    /* -----------------------------------------
      PIN / UNPIN (admin only)
    ----------------------------------------- */
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
        await setDoc(
          replyRef,
          { pinned: !currentlyPinned },
          { merge: true }
        );
        if (statusEl) statusEl.textContent = currentlyPinned ? "Unpinned reply." : "Pinned reply.";
      } catch (err) {
        console.error("[Pin Reply]", err);
        if (statusEl) statusEl.textContent = "Unable to update pin.";
      }

      return;
    }

    /* -----------------------------------------
      THREAD COLLAPSE TOGGLE
    ----------------------------------------- */
    const collapseToggle = target.closest(".reply-collapse-toggle");
    if (collapseToggle) {
      const group = collapseToggle.closest(".discussion-thread-group");
      if (!group) return;

      const cards = Array.from(group.querySelectorAll(".discussion-message"));
      const deepCards = cards.filter(c => Number(c.dataset.depth || 0) >= 3);
      if (!deepCards.length) return;

      const collapsed = deepCards.some(c => c.classList.contains("is-collapsed"));
      deepCards.forEach(c => c.classList.toggle("is-collapsed", !collapsed));

      collapseToggle.textContent = collapsed
        ? "Hide replies"
        : `View ${deepCards.length} replies`;

      collapseToggle.setAttribute("aria-expanded", String(collapsed));
      return;
    }

    /* -----------------------------------------
      REPLY BUTTON
    ----------------------------------------- */
    const replyBtn = target.closest(".btn-reply-comment");
    if (replyBtn) {
      const replyId = replyBtn.dataset.replyId;
      const snippet = replyBtn.dataset.snippet || "";

      if (parentReplyField && replyId) parentReplyField.value = replyId;
      if (replyContextSnippet) replyContextSnippet.textContent = snippet;
      if (replyContext) replyContext.hidden = false;

      const details = document
        .getElementById("add-reply")
        ?.querySelector("details");

      if (details && !details.open) details.open = true;

      requestAnimationFrame(() => {
        if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      return;
    }

    /* -----------------------------------------
      CANCEL REPLY CONTEXT
    ----------------------------------------- */
    if (target.id === "cancel-reply-context") {
      if (parentReplyField) parentReplyField.value = "";
      if (replyContext) replyContext.hidden = true;
      return;
    }

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
    }
  }

  /* Attach once */
  document.addEventListener("pointerup", handleActionEvent, { passive: false });

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

      const steelField = form.querySelector("#steelman-summary");
      const bodyField = form.querySelector("#reply-body");
      const pseudoField = form.querySelector("#pseudonym");

      const steel = steelField?.value.trim() || "";
      const body = bodyField?.value.trim() || "";
      const pseudo = pseudoField?.value.trim() || "Anonymous Seeker";
      const parentId = parentReplyField?.value || null;

      const steelWords = steel.split(/\s+/).filter(Boolean).length;
      const bodyWords = body.split(/\s+/).filter(Boolean).length;

      if (steelWords < 30) {
        if (statusEl) statusEl.textContent = "Your Steel Man summary must be at least 30 words.";
        return;
      }

      if (bodyWords < 20) {
        if (statusEl) statusEl.textContent = "Your reply must be at least 20 words.";
        return;
      }

      if (statusEl) statusEl.textContent = "Posting reply...";

      try {
        await addDoc(repliesRef, {
          userId: currentUser.uid,
          pseudonym: pseudo,
          steelmanSummary: steel,
          body,
          createdAt: serverTimestamp(),
          parentReplyId: parentId,
          pinned: false
        });

        Reputation.awardPoints(
          currentUser.uid,
          1,
          "reply",
          `Reply posted in topic ${topicId}`,
          topicId
        ).catch(() => {});

        form.reset();
        if (parentReplyField) parentReplyField.value = "";
        if (replyContext) replyContext.hidden = true;

        if (statusEl) statusEl.textContent = "Reply posted.";
      } catch (err) {
        console.error("[Reply Error]", err);
        if (statusEl) statusEl.textContent = "There was a problem posting your reply. Please try again.";
      }
    });
  }
});

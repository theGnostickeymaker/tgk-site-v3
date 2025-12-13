/* =============================================================
   TGK Community — Topic Engine v3.1
   • Stable nested replies
   • Depth-sorted rendering fix (parents always load before children)
   • Voting (Insight / Agree / Challenge)
   • Pin / unpin (admin)
   • Reputation hooks + live badges
   • Clean reply context behaviour
   • Safe rendering + error guards
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

  const minWriteTierAttr =
    root.getAttribute("data-min-write-tier") || "initiate";

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  const parentReplyField = document.getElementById("parent-reply-id");
  const replyContext = document.getElementById("reply-context");
  const replyContextSnippet = document.getElementById("reply-context-snippet");

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  const reputationSubscriptions = new Map();


  /* -----------------------------------------------------------
     Tier helpers
     ----------------------------------------------------------- */
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
    if (authHintEl && message) authHintEl.textContent = message;
  }


  /* -----------------------------------------------------------
     Reputation badge helpers
     ----------------------------------------------------------- */
  function keysRank(score) {
    if (score >= 500) return "Guardian";
    if (score >= 200) return "Keeper";
    if (score >= 50)  return "Initiate";
    if (score >= 1)   return "Seeker";
    return "Observer";
  }

  function badgeFor(score) {
    if (!score || score < 1) return "";
    if (score >= 500) return "🜂";
    if (score >= 200) return "⟆";
    if (score >= 50)  return "✦";
    return "✧";
  }

  function extractScore(repData) {
    if (!repData || typeof repData !== "object") return 0;
    if (typeof repData.total === "number") return repData.total;
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
      const base = el.dataset.baseName || el.textContent.replace(/[🜂⟆✦✧]/g, "").trim();
      el.dataset.baseName = base;

      el.textContent = badge ? `${base} ${badge}` : base;

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
      snap => updateAuthorBadges(userId, snap.exists() ? snap.data() : null),
      err => console.warn("[Reputation] Snapshot error:", err)
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

    const tokenResult = await user.getIdTokenResult();
    currentTier = tokenResult.claims.tier || "free";
    isAdmin =
      tokenResult.claims.tier === "admin" ||
      tokenResult.claims.role === "admin";

    if (!minTierSatisfied()) {
      setFormEnabled(false, `Upgrade to “${minWriteTierAttr}” to contribute.`);
      return;
    }

    setFormEnabled(true, "You are signed in. Your contribution will appear with your chosen pseudonym.");
  });


  /* -----------------------------------------------------------
     Firestore reply listener
     With depth-sorted nested threading
     ----------------------------------------------------------- */
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, (snapshot) => {
    if (!messagesEl) return;
    messagesEl.innerHTML = "";

    if (snapshot.empty) {
      messagesEl.innerHTML = `
        <p class="muted small">No contributions yet. Be the first to offer a Steel Man summary.</p>
      `;
      return;
    }

    // Build array of reply objects
    const allReplies = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      data: docSnap.data()
    }));

    // Compute depth (distance from root)
    function getDepth(reply) {
      let depth = 0;
      let parent = reply.data.parentReplyId;

      while (parent) {
        const p = allReplies.find(r => r.id === parent);
        if (!p) break;
        depth++;
        parent = p.data.parentReplyId;
      }
      return depth;
    }

    allReplies.forEach(r => {
      r.depth = getDepth(r);
    });

    // Sort by depth: parents first, children after
    allReplies.sort((a, b) => a.depth - b.depth);

    const containersById = {};

    // First pass: build all cards
    allReplies.forEach(r => {
      const card = buildReplyCard(r.id, r.data);
      containersById[r.id] = card;

      if (r.data.userId) ensureReputationSubscription(r.data.userId);
    });

    // Second pass: append to DOM in correct order
    allReplies.forEach(r => {
      const card = containersById[r.id];
      const parentId = r.data.parentReplyId;

      if (parentId && containersById[parentId]) {
        let kids = containersById[parentId].querySelector(".discussion-children");
        if (!kids) {
          kids = document.createElement("div");
          kids.className = "discussion-children";
          containersById[parentId].appendChild(kids);
        }
        kids.appendChild(card);
      } else {
        messagesEl.appendChild(card);
      }

      setupVotes(topicId, r.id, card);
    });
  });


  /* -----------------------------------------------------------
     Build a reply card
     ----------------------------------------------------------- */
  function buildReplyCard(replyId, data) {
    const card = document.createElement("article");
    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.id = `comment-${replyId}`;

    if (data.userId) card.dataset.userId = data.userId;
    if (data.pinned) card.classList.add("is-pinned");

    // Header
    const header = document.createElement("div");
    header.className = "discussion-message-header";

    const author = document.createElement("span");
    author.className = "discussion-message-author";

    const pseudo = data.pseudonym || "Anonymous Seeker";
    author.dataset.baseName = pseudo;
    author.textContent = pseudo;

    const meta = document.createElement("span");
    meta.className = "discussion-message-meta";
    const ts = data.createdAt?.toDate?.();
    meta.textContent = ts ? ts.toLocaleString() : "Pending timestamp";

    header.appendChild(author);
    header.appendChild(meta);

    // Steel Man block
    const steelBlock = document.createElement("div");
    steelBlock.className = "discussion-message-steelman reply-steelman-body";

    if (data.steelmanSummary) {
      steelBlock.innerHTML = `
        <div class="steelman-label">Steel Man Summary</div>
        <div class="steelman-text">${data.steelmanSummary}</div>
      `;
    }

    // Body
    const body = document.createElement("div");
    body.className = "discussion-message-body reply-body-text";
    body.textContent = data.body || "";

    // Actions
    const actions = document.createElement("div");
    actions.className = "discussion-actions";

    // Reply button
    const replyBtn = document.createElement("button");
    replyBtn.type = "button";
    replyBtn.className = "btn-link btn-reply-comment";
    replyBtn.dataset.replyId = replyId;
    replyBtn.dataset.snippet = (data.steelmanSummary || data.body || "").slice(0, 120);
    replyBtn.textContent = "Reply";
    actions.appendChild(replyBtn);

    // Votes
    const voteGroup = document.createElement("div");
    voteGroup.className = "vote-group";
    voteGroup.dataset.replyId = replyId;

    voteGroup.innerHTML = `
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="insight">
        🜁 <span class="vote-label">Insight</span>
        <span class="vote-count" data-count-type="insight">0</span>
      </button>

      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="agree">
        ✦ <span class="vote-label">Agree</span>
        <span class="vote-count" data-count-type="agree">0</span>
      </button>

      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="challenge">
        ⛧ <span class="vote-label">Challenge</span>
        <span class="vote-count" data-count-type="challenge">0</span>
      </button>
    `;

    actions.appendChild(voteGroup);

    // Edit button
    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-link btn-edit-reply";
      editBtn.dataset.replyId = replyId;
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);
    }

    // Delete button
    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-link btn-delete-comment";
      delBtn.dataset.commentId = replyId;
      delBtn.dataset.topicId = topicId;
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);
    }

    // Pin
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
     Voting system
     ----------------------------------------------------------- */
  function setupVotes(topicId, replyId, card) {
    const votesRef = collection(
      db, "topics", topicId, "replies", replyId, "votes"
    );

    onSnapshot(votesRef, (snapshot) => {
      const counts = { insight: 0, agree: 0, challenge: 0 };
      let userVote = null;

      snapshot.forEach(snap => {
        const v = snap.data();
        if (v && counts[v.type] != null) counts[v.type]++;
        if (currentUser && snap.id === currentUser.uid) userVote = v.type;
      });

      // Update counts
      Object.entries(counts).forEach(([type, count]) => {
        const el = card.querySelector(`.vote-count[data-count-type="${type}"]`);
        if (el) el.textContent = count;
      });

      // Highlight user vote
      card.querySelectorAll(".vote-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.voteType === userVote);
      });
    });
  }


  async function toggleVote(topicId, replyId, voteType) {
    if (!currentUser) {
      if (statusEl) statusEl.textContent = "You must be signed in to vote.";
      return;
    }

    const replyRef = doc(db, "topics", topicId, "replies", replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;

    const replyAuthor = replySnap.data().userId;

    const voteRef = doc(
      db, "topics", topicId, "replies", replyId, "votes", currentUser.uid
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
          topicId
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
    const symbols = ["✧", "☉", "𐌗"];
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
     Click handlers (reply, vote, pin)
     ----------------------------------------------------------- */
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    // Reply button
    const replyBtn = target.closest(".btn-reply-comment");
    if (replyBtn) {
      const replyId = replyBtn.dataset.replyId;
      const snippet = replyBtn.dataset.snippet || "";

      parentReplyField.value = replyId;
      replyContextSnippet.textContent = snippet;
      replyContext.hidden = false;

      form?.scrollIntoView({ behaviour: "smooth", block: "start" });
      return;
    }

    // Cancel reply context
    if (target.id === "cancel-reply-context") {
      parentReplyField.value = "";
      replyContext.hidden = true;
      return;
    }

    // Voting
    const voteBtn = target.closest("button.vote-btn");
    if (voteBtn) {
      const replyId = voteBtn.dataset.replyId;
      const voteType = voteBtn.dataset.voteType;

      spawnRipple(voteBtn, event.clientX, event.clientY);
      if (voteType === "insight") spawnInsightParticles(voteBtn);

      try {
        await toggleVote(topicId, replyId, voteType);
      } catch (err) {
        console.error("[Vote] Error:", err);
        statusEl.textContent = "Unable to register vote.";
      }
      return;
    }

    // Pin (admin only)
    const pinBtn = target.closest(".btn-pin-reply");
    if (pinBtn && isAdmin) {
      const replyId = pinBtn.dataset.replyId;
      const card = document.getElementById(`comment-${replyId}`);
      const pinned = card?.classList.contains("is-pinned");

      await setDoc(
        doc(db, "topics", topicId, "replies", replyId),
        { pinned: !pinned },
        { merge: true }
      );
      return;
    }
  });


  /* -----------------------------------------------------------
     Submit handler
     ----------------------------------------------------------- */
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!currentUser) {
        statusEl.textContent = "You must be signed in to post.";
        return;
      }

      if (!minTierSatisfied()) {
        statusEl.textContent =
          `Your tier (“${currentTier}”) is not sufficient to post here.`;
        return;
      }

      const steel = form.querySelector("#steelman-summary").value.trim();
      const body = form.querySelector("#reply-body").value.trim();
      const pseudo = form.querySelector("#pseudonym").value.trim() || "Anonymous Seeker";
      const parentId = parentReplyField.value || null;

      if (steel.split(/\s+/).length < 30) {
        statusEl.textContent = "Your Steel Man summary must be at least 30 words.";
        return;
      }

      if (body.split(/\s+/).length < 20) {
        statusEl.textContent = "Your reply must be at least 20 words.";
        return;
      }

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
        parentReplyField.value = "";
        replyContext.hidden = true;

        statusEl.textContent = "Reply posted.";
      } catch (err) {
        console.error("[Reply Error]", err);
        statusEl.textContent = "There was a problem posting your reply.";
      }
    });
  }
});

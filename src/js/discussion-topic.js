// =============================================================
// TGK Community — Topic engine v2.7
// Enhancements:
//  • Stable nested replies
//  • Voting (Insight / Agree / Challenge)
//  • Pin / unpin for admin
//  • Reputation hooks + live badges
//  • Clean reply context behaviour
//  • Safe rendering + error guards
// =============================================================

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

  // ------------------------------------------------------------
  // Core DOM references
  // ------------------------------------------------------------
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

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  // Map<userId, unsubscribeFn>
  const reputationSubscriptions = new Map();

  // ------------------------------------------------------------
  // Tier helpers
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Keys rank + badge helpers
  // ------------------------------------------------------------
  function keysRank(score) {
    if (score >= 500) return "Guardian";
    if (score >= 200) return "Keeper";
    if (score >= 50)  return "Initiate";
    if (score >= 1)   return "Seeker";
    return "Observer";
  }

  function badgeFor(score) {
    if (!score || score < 1) return "";
    if (score >= 500) return "🜂";  // Guardian
    if (score >= 200) return "⟆";  // Keeper
    if (score >= 50)  return "✦";  // Initiate
    return "✧";                    // Seeker
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

    authorEls.forEach((el) => {
      const existingBase = el.dataset.baseName;
      let baseName = existingBase;

      if (!baseName) {
        const raw = el.textContent || "";
        baseName = raw
          .replace("🜂", "")
          .replace("⟆", "")
          .replace("✦", "")
          .replace("✧", "")
          .trim();
        el.dataset.baseName = baseName;
      }

      if (badge) {
        el.textContent = `${baseName} ${badge}`;
      } else {
        el.textContent = baseName;
      }

      if (rank && score > 0) {
        el.title = `Keys rank: ${rank} (${score} Keys)`;
      } else {
        el.removeAttribute("title");
      }
    });
  }

  function ensureReputationSubscription(userId) {
    if (!userId || reputationSubscriptions.has(userId)) return;

    const repRef = doc(db, "reputation", userId);

    const unsub = onSnapshot(
      repRef,
      (snap) => {
        const repData = snap.exists() ? snap.data() : null;
        updateAuthorBadges(userId, repData);
      },
      (error) => {
        console.warn("[Reputation] Snapshot error:", error);
      }
    );

    reputationSubscriptions.set(userId, unsub);
  }

  // ------------------------------------------------------------
  // Auth tracking
  // ------------------------------------------------------------
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
      isAdmin =
        tokenResult.claims.tier === "admin" ||
        tokenResult.claims.role === "admin";
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

  // ------------------------------------------------------------
  // Firestore listener for replies
  // ------------------------------------------------------------
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, (snapshot) => {
    if (!messagesEl) return;

    messagesEl.innerHTML = "";

    if (snapshot.empty) {
      messagesEl.innerHTML = `
        <p class="muted small">
          No contributions yet. Be the first to offer a Steel Man summary.
        </p>
      `;
      return;
    }

    const containersById = {};
    const dataById = {};

    // First pass: create cards and subscribe to reputation
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const replyId = docSnap.id;

      dataById[replyId] = data;
      const card = buildReplyCard(replyId, data);
      containersById[replyId] = card;

      if (data.userId) {
        ensureReputationSubscription(data.userId);
      }
    });

    // Second pass: nest replies under their parents
    snapshot.forEach((docSnap) => {
      const replyId = docSnap.id;
      const data = dataById[replyId];
      const card = containersById[replyId];

      const parentId = data.parentReplyId || null;

      if (parentId && containersById[parentId]) {
        let childrenWrap = containersById[parentId].querySelector(".discussion-children");
        if (!childrenWrap) {
          childrenWrap = document.createElement("div");
          childrenWrap.className = "discussion-children";
          containersById[parentId].appendChild(childrenWrap);
        }
        childrenWrap.appendChild(card);
      } else {
        messagesEl.appendChild(card);
      }

      setupVotes(topicId, replyId, card);
    });
  });

  // ------------------------------------------------------------
  // Card builder
  // ------------------------------------------------------------
  function buildReplyCard(replyId, data) {
    const card = document.createElement("article");
    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.id = `comment-${replyId}`;

    if (data.userId) {
      card.dataset.userId = data.userId;
    }

    if (data.pinned) {
      card.classList.add("is-pinned");
    }

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
      const label = document.createElement("div");
      label.className = "steelman-label";
      label.textContent = "Steel Man Summary";

      const text = document.createElement("div");
      text.className = "steelman-text";
      text.textContent = data.steelmanSummary;

      steelBlock.appendChild(label);
      steelBlock.appendChild(text);
    }

    // Body
    const body = document.createElement("div");
    body.className = "discussion-message-body reply-body-text";
    body.textContent = data.body || "";

    // Actions: reply, votes, edit, delete, pin
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

    // Vote group
    const voteGroup = document.createElement("div");
    voteGroup.className = "vote-group";
    voteGroup.dataset.replyId = replyId;

    voteGroup.innerHTML = `
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="insight">
        🜁 <span class="vote-label">Insight</span>
        <span class="vote-count" data-count-type="insight">0</span>
        <span class="vote-tooltip">Highlights valuable analysis</span>
      </button>

      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="agree">
        ✦ <span class="vote-label">Agree</span>
        <span class="vote-count" data-count-type="agree">0</span>
        <span class="vote-tooltip">Signals alignment with the point made</span>
      </button>

      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="challenge">
        ⛧ <span class="vote-label">Challenge</span>
        <span class="vote-count" data-count-type="challenge">0</span>
        <span class="vote-tooltip">Pushes respectfully against the argument</span>
      </button>
    `;

    actions.appendChild(voteGroup);

    // Edit button (owner or admin)
    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn-link btn-edit-reply";
      editBtn.dataset.replyId = replyId;
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);
    }

    // Delete button (admin)
    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-link btn-delete-comment";
      delBtn.dataset.commentId = replyId;
      delBtn.dataset.topicId = topicId;
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);
    }

    // Pin / Unpin (admin)
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

  // ------------------------------------------------------------
  // Voting system
  // ------------------------------------------------------------
  function setupVotes(topicId, replyId, card) {
    const votesRef = collection(
      db,
      "topics",
      topicId,
      "replies",
      replyId,
      "votes"
    );

    onSnapshot(votesRef, (snapshot) => {
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
        if (el) el.textContent = count;
      });

      card.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.voteType === userVote);
      });
    });
  }

  async function toggleVote(topicId, replyId, voteType) {
    if (!currentUser) {
      if (statusEl) statusEl.textContent = "You must be signed in to vote.";
      return;
    }

    const voteRef = doc(
      db,
      "topics",
      topicId,
      "replies",
      replyId,
      "votes",
      currentUser.uid
    );

    const snap = await getDoc(voteRef);

    if (snap.exists() && snap.data().type === voteType) {
      await deleteDoc(voteRef);
      return;
    }

    await setDoc(voteRef, {
      type: voteType,
      createdAt: serverTimestamp()
    });

    try {
      const amount =
        voteType === "insight" ? 3 :
        voteType === "agree"   ? 1 : 1;

      await Reputation.awardPoints(
        amount,
        "vote",
        `Vote ${voteType} on reply ${replyId}`,
        topicId
      );
    } catch (e) {
      console.warn("[Reputation] vote award failed:", e);
    }
  }

  // ------------------------------------------------------------
  // Vote animation helpers
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
// Click handlers (reply, vote, pin)
// ------------------------------------------------------------
document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  // ----------------------------------------------------------
  // Reply button (support clicks on inner spans)
  // ----------------------------------------------------------
  const replyBtn = target.closest(".btn-reply-comment");
  if (replyBtn) {
    const replyId = replyBtn.dataset.replyId;
    const snippet = replyBtn.dataset.snippet || "";

    if (parentReplyField && replyId) {
      parentReplyField.value = replyId;
    }

    if (replyContextSnippet) replyContextSnippet.textContent = snippet;
    if (replyContext) replyContext.hidden = false;

    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  // ----------------------------------------------------------
  // Cancel reply context
  // ----------------------------------------------------------
  if (target.id === "cancel-reply-context") {
    if (parentReplyField) parentReplyField.value = "";
    if (replyContext) replyContext.hidden = true;
    return;
  }

  // ----------------------------------------------------------
  // Voting on replies (Insight / Agree / Challenge)
  // ----------------------------------------------------------
  const voteBtn = target.closest("button.vote-btn");
  if (voteBtn) {
    const replyId  = voteBtn.dataset.replyId;
    const voteType = voteBtn.dataset.voteType;

    if (!replyId || !voteType) return;

    // button animations
    spawnRipple(voteBtn, event.clientX, event.clientY);
    if (voteType === "insight") spawnInsightParticles(voteBtn);

    try {
      // Load the reply so we know who to award Keys to
      const replyRef = doc(db, "topics", topicId, "replies", replyId);
      const replySnap = await getDoc(replyRef);

      if (!replySnap.exists()) {
        console.error("Vote failed: reply not found", replyId);
        return;
      }

      const replyData = replySnap.data();
      const authorUid = replyData.userId;    // *** THIS IS THE FIX ***

      // Award reputation to the AUTHOR, not the voter
      const points =
        voteType === "challenge" ? 3 :
        voteType === "agree"     ? 1 :
        voteType === "insight"   ? 1 : 0;

      if (points > 0) {
        await Reputation.awardPoints(
          authorUid,
          points,
          "vote",
          `Received a ${voteType} vote`,
          topicId
        );
      }

      // Update vote state inside Firestore
      await toggleVote(topicId, replyId, voteType);

    } catch (e) {
      console.error("[Vote] Error:", e);
      if (statusEl) statusEl.textContent = "Unable to register vote. Please try again.";
    }

    return;
  }

  // ----------------------------------------------------------
  // Pin / unpin (admin only)
  // ----------------------------------------------------------
  const pinBtn = target.closest(".btn-pin-reply");
  if (pinBtn) {
    if (!isAdmin) return;

    const replyId = pinBtn.dataset.replyId;
    if (!replyId) return;

    const card = document.getElementById(`comment-${replyId}`);
    const currentlyPinned = card?.classList.contains("is-pinned") || false;

    try {
      await setDoc(
        doc(db, "topics", topicId, "replies", replyId),
        { pinned: !currentlyPinned },
        { merge: true }
      );
    } catch (e) {
      console.error("Unable to toggle pin:", e);
    }

    return;
  }
});


  // ------------------------------------------------------------
  // Submit handler
  // ------------------------------------------------------------
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!currentUser) {
        if (statusEl) statusEl.textContent = "You must be signed in to post.";
        return;
      }

      if (!minTierSatisfied()) {
        if (statusEl) {
          statusEl.textContent = `Your tier (“${currentTier}”) is not sufficient to post here.`;
        }
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
        if (statusEl) {
          statusEl.textContent = "Your Steel Man summary is too short. Minimum 30 words.";
        }
        return;
      }

      if (bodyWords < 20) {
        if (statusEl) {
          statusEl.textContent = "Your reply is too short. Minimum 20 words.";
        }
        return;
      }

      if (statusEl) statusEl.textContent = "Posting reply...";

      try {
        await addDoc(repliesRef, {
          userId: currentUser.uid,
          pseudonym: pseudo,
          steelmanSummary: steel,
          body: body,
          createdAt: serverTimestamp(),
          parentReplyId: parentId,
          pinned: false
        });

        try {
          await Reputation.awardPoints(
            1,
            "reply",
            `Reply posted in topic ${topicId}`,
            topicId
          );
        } catch (repErr) {
          console.warn("[Reputation] reply award failed:", repErr);
        }

        form.reset();
        if (parentReplyField) parentReplyField.value = "";
        if (replyContext) replyContext.hidden = true;

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

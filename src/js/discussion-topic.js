// =============================================================
// TGK Community — Topic Engine v3.1 (with Mobile Debug Panel)
//  • Nested replies
//  • Voting
//  • Pinning
//  • Reputation badges
//  • Reply context
//  • Mobile-safe debug output (Edge iOS fix)
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

  // ============================================================
  //  🔧 MOBILE DEBUG PANEL (Auto-injected)
  // ============================================================
  let debugBox = document.getElementById("tgk-debug");
  if (!debugBox) {
    debugBox = document.createElement("div");
    debugBox.id = "tgk-debug";
    debugBox.style =
      "padding:0.5rem;margin:0.5rem 0;font-size:0.7rem;color:#ccc;background:rgba(0,0,0,0.25);max-height:160px;overflow:auto;border-radius:6px;";
    document.body.appendChild(debugBox);
  }

  function debugLog(msg) {
    if (!debugBox) return;
    const line = document.createElement("div");
    line.textContent = `[DBG] ${msg}`;
    debugBox.appendChild(line);
  }

  debugLog("discussion-topic.js initialised");

  // ============================================================
  // Core DOM references
  // ============================================================
  const root = document.getElementById("discussion-root");
  if (!root) {
    debugLog("No #discussion-root found. Exiting.");
    return;
  }

  const topicId = root.getAttribute("data-topic-id");
  if (!topicId) {
    debugLog("No topic ID found.");
    return;
  }

  const minWriteTierAttr =
    root.getAttribute("data-min-write-tier") || "initiate";

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  const parentReplyField = document.getElementById("parent-reply-id");
  const replyContext = document.getElementById("reply-context");
  const replyContextSnippet = document.getElementById(
    "reply-context-snippet"
  );

  let currentUser = null;
  let currentTier = "free";
  let isAdmin = false;

  const reputationSubscriptions = new Map();

  debugLog(`Topic ID detected: ${topicId}`);
  debugLog(`Topic write tier required: ${minWriteTierAttr}`);

  // ============================================================
  // Tier helpers
  // ============================================================
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
      Array.from(form.elements).forEach((el) => el.disabled = false);
    } else {
      form.classList.add("is-disabled");
      Array.from(form.elements).forEach((el) => {
        if (el.tagName !== "P") el.disabled = true;
      });
    }

    if (authHintEl && message) authHintEl.textContent = message;
  }

  // ============================================================
  // Reputation helpers
  // ============================================================
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
    if (!repData) return 0;
    return repData.total ?? repData.score ?? 0;
  }

  function updateAuthorBadges(userId, repData) {
    const score = extractScore(repData);
    const badge = badgeFor(score);
    const rank = keysRank(score);

    const authorEls = document.querySelectorAll(
      `.discussion-message[data-user-id="${userId}"] .discussion-message-author`
    );

    authorEls.forEach((el) => {
      const base = el.dataset.baseName || el.textContent.split(" ")[0];
      el.dataset.baseName = base;
      el.textContent = badge ? `${base} ${badge}` : base;
      el.title = score > 0 ? `Keys rank: ${rank} (${score})` : "";
    });
  }

  function canReadReputation(uid) {
    return currentUser && (isAdmin || currentUser.uid === uid);
  }

  function ensureReputationSubscription(uid) {
    if (!uid || reputationSubscriptions.has(uid)) return;
    if (!canReadReputation(uid)) return;

    debugLog(`Subscribing to reputation for user: ${uid}`);

    const repRef = doc(db, "reputation", uid);

    const unsub = onSnapshot(
      repRef,
      snap => updateAuthorBadges(uid, snap.exists() ? snap.data() : null),
      err => debugLog(`[Reputation snapshot error] ${err.message}`)
    );

    reputationSubscriptions.set(uid, unsub);
  }

  // ============================================================
  // Auth tracking
  // ============================================================
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    debugLog(`Auth state changed. User = ${user ? user.uid : "null"}`);

    if (!user) {
      currentTier = "free";
      setFormEnabled(false, "Sign in to join the discussion.");
      return;
    }

    try {
      const token = await user.getIdTokenResult(true);
      currentTier = token.claims.tier || "free";
      isAdmin =
        token.claims.tier === "admin" ||
        token.claims.role === "admin";

      debugLog(`User tier: ${currentTier}, admin=${isAdmin}`);
    } catch (err) {
      debugLog(`Unable to read token claims: ${err.message}`);
    }

    if (!minTierSatisfied()) {
      setFormEnabled(false, `Upgrade to “${minWriteTierAttr}” to contribute.`);
      return;
    }

    setFormEnabled(true, "You may contribute.");
  });

  // ============================================================
  // Replies listener
  // ============================================================
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  debugLog("Binding Firestore replies snapshot…");

  onSnapshot(
    repliesQuery,
    (snapshot) => {
      debugLog(`Snapshot received: ${snapshot.size} replies`);

      if (!messagesEl) return;
      messagesEl.innerHTML = "";

      if (snapshot.empty) {
        messagesEl.innerHTML =
          `<p class="muted small">No contributions yet.</p>`;
        return;
      }

      const containersById = {};
      const dataById = {};

      // Build cards
      snapshot.forEach((snap) => {
        const data = snap.data();
        const replyId = snap.id;

        dataById[replyId] = data;
        containersById[replyId] = buildReplyCard(replyId, data);

        if (data.userId) ensureReputationSubscription(data.userId);
      });

      // Nesting
      snapshot.forEach((snap) => {
        const replyId = snap.id;
        const data = dataById[replyId];
        const card = containersById[replyId];
        const parentId = data.parentReplyId;

        if (parentId && containersById[parentId]) {
          let children = containersById[parentId].querySelector(".discussion-children");
          if (!children) {
            children = document.createElement("div");
            children.className = "discussion-children";
            containersById[parentId].appendChild(children);
          }
          children.appendChild(card);
        } else {
          messagesEl.appendChild(card);
        }

        setupVotes(topicId, replyId, card);
      });
    },
    (err) => {
      debugLog(`Snapshot error: ${err.message}`);
    }
  );

  // ============================================================
  // Reply card builder
  // ============================================================
  function buildReplyCard(replyId, data) {
    const card = document.createElement("article");
    card.className = "discussion-message";
    card.dataset.replyId = replyId;
    card.dataset.userId = data.userId || "";
    card.id = `comment-${replyId}`;

    if (data.pinned) card.classList.add("is-pinned");

    // Header
    const header = document.createElement("div");
    header.className = "discussion-message-header";

    const author = document.createElement("span");
    author.className = "discussion-message-author";
    author.dataset.baseName = data.pseudonym || "Anonymous Seeker";
    author.textContent = data.pseudonym || "Anonymous Seeker";

    const meta = document.createElement("span");
    meta.className = "discussion-message-meta";
    const ts = data.createdAt?.toDate?.();
    meta.textContent = ts ? ts.toLocaleString() : "Pending timestamp";

    header.appendChild(author);
    header.appendChild(meta);

    // Steelman
    const steelBlock = document.createElement("div");
    steelBlock.className = "discussion-message-steelman";
    if (data.steelmanSummary) {
      steelBlock.innerHTML =
        `<div class="steelman-label">Steel Man Summary</div>
         <div>${data.steelmanSummary}</div>`;
    }

    // Body
    const body = document.createElement("div");
    body.className = "discussion-message-body";
    body.textContent = data.body || "";

    // Actions
    const actions = document.createElement("div");
    actions.className = "discussion-actions";

    // Reply button
    const replyBtn = document.createElement("button");
    replyBtn.className = "btn-link btn-reply-comment";
    replyBtn.dataset.replyId = replyId;
    replyBtn.dataset.snippet =
      (data.steelmanSummary || data.body || "").slice(0, 120);
    replyBtn.textContent = "Reply";

    actions.appendChild(replyBtn);

    // Voting group
    const voteGroup = document.createElement("div");
    voteGroup.className = "vote-group";
    voteGroup.dataset.replyId = replyId;

    voteGroup.innerHTML = `
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="insight">
        🜁 Insight <span class="vote-count" data-count-type="insight">0</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="agree">
        ✦ Agree <span class="vote-count" data-count-type="agree">0</span>
      </button>
      <button type="button" class="vote-btn" data-reply-id="${replyId}" data-vote-type="challenge">
        ⛧ Challenge <span class="vote-count" data-count-type="challenge">0</span>
      </button>
    `;

    actions.appendChild(voteGroup);

    // Edit
    if (currentUser && (currentUser.uid === data.userId || isAdmin)) {
      const editBtn = document.createElement("button");
      editBtn.className = "btn-link btn-edit-reply";
      editBtn.dataset.replyId = replyId;
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);
    }

    // Delete
    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.className = "btn-link btn-delete-comment";
      delBtn.dataset.commentId = replyId;
      delBtn.dataset.topicId = topicId;
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);
    }

    // Pin
    if (isAdmin) {
      const pinBtn = document.createElement("button");
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

  // ============================================================
  // Voting logic
  // ============================================================
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
        if (v && v.type && counts[v.type] !== undefined) {
          counts[v.type]++;
        }
        if (currentUser && snap.id === currentUser.uid && v) {
          userVote = v.type;
        }
      });

      for (let [type, count] of Object.entries(counts)) {
        const countEl = card.querySelector(
          `.vote-count[data-count-type="${type}"]`
        );
        if (countEl) countEl.textContent = count;
      }

      card.querySelectorAll(".vote-btn").forEach((btn) => {
        btn.classList.toggle(
          "active",
          btn.dataset.voteType === userVote
        );
      });
    });
  }

  async function toggleVote(topicId, replyId, voteType) {
    if (!currentUser) {
      if (statusEl) statusEl.textContent = "Sign in to vote.";
      return;
    }

    debugLog(`Vote cast: reply=${replyId} type=${voteType}`);

    const replyRef = doc(db, "topics", topicId, "replies", replyId);
    const snap = await getDoc(replyRef);
    if (!snap.exists()) return;

    const replyAuthor = snap.data().userId;

    const voteRef = doc(
      db,
      "topics",
      topicId,
      "replies",
      replyId,
      "votes",
      currentUser.uid
    );

    const prevSnap = await getDoc(voteRef);
    const prevType = prevSnap.exists() ? prevSnap.data().type : null;

    const pts = { insight: 3, agree: 1, challenge: 1 };
    let delta = 0;

    if (prevType === voteType) {
      await deleteDoc(voteRef);
      delta = -pts[voteType];
    } else if (!prevType) {
      await setDoc(voteRef, {
        type: voteType,
        createdAt: serverTimestamp()
      });
      delta = pts[voteType];
    } else {
      await setDoc(voteRef, {
        type: voteType,
        createdAt: serverTimestamp()
      });
      delta = pts[voteType] - pts[prevType];
    }

    if (delta !== 0 && replyAuthor) {
      Reputation.awardPoints(
        replyAuthor,
        delta,
        "vote",
        `Vote ${voteType} on reply ${replyId}`,
        topicId
      ).catch(err => debugLog(`Reputation error: ${err.message}`));
    }
  }

  // ============================================================
  // UI click handling
  // ============================================================
  document.addEventListener("click", async (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;

    // Reply button
    const r = t.closest(".btn-reply-comment");
    if (r) {
      debugLog(`Reply clicked for ${r.dataset.replyId}`);
      const id = r.dataset.replyId;
      const snippet = r.dataset.snippet || "";

      parentReplyField.value = id;
      replyContextSnippet.textContent = snippet;
      replyContext.hidden = false;

      form.scrollIntoView({ behaviour: "smooth" });
      return;
    }

    // Cancel reply
    if (t.id === "cancel-reply-context") {
      parentReplyField.value = "";
      replyContext.hidden = true;
      debugLog("Reply context cancelled");
      return;
    }

    // Vote
    const vb = t.closest(".vote-btn");
    if (vb) {
      const replyId = vb.dataset.replyId;
      const type = vb.dataset.voteType;

      spawnRipple(vb, event.clientX, event.clientY);
      if (type === "insight") spawnInsightParticles(vb);

      try {
        await toggleVote(topicId, replyId, type);
      } catch (err) {
        debugLog(`Vote error: ${err.message}`);
      }
      return;
    }

    // Pin
    const pb = t.closest(".btn-pin-reply");
    if (pb && isAdmin) {
      const replyId = pb.dataset.replyId;
      debugLog(`Pin toggle for reply ${replyId}`);

      const card = document.getElementById(`comment-${replyId}`);
      const currentlyPinned = card?.classList.contains("is-pinned");

      try {
        await setDoc(
          doc(db, "topics", topicId, "replies", replyId),
          { pinned: !currentlyPinned },
          { merge: true }
        );
      } catch (err) {
        debugLog(`Pin error: ${err.message}`);
      }
      return;
    }
  });

  // ============================================================
  // Reply submission
  // ============================================================
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!currentUser) {
        statusEl.textContent = "You must be signed in.";
        return;
      }

      if (!minTierSatisfied()) {
        statusEl.textContent =
          `Your tier (${currentTier}) is below the required level (${minWriteTierAttr}).`;
        return;
      }

      const steel = form.querySelector("#steelman-summary")?.value.trim() || "";
      const body = form.querySelector("#reply-body")?.value.trim() || "";
      const pseudo = form.querySelector("#pseudonym")?.value.trim() || "Anonymous Seeker";
      const parentId = parentReplyField.value || null;

      const steelWords = steel.split(/\s+/).filter(Boolean).length;
      const bodyWords = body.split(/\s+/).filter(Boolean).length;

      if (steelWords < 30) {
        statusEl.textContent = "Steel Man summary must be 30+ words.";
        return;
      }

      if (bodyWords < 20) {
        statusEl.textContent = "Reply body must be 20+ words.";
        return;
      }

      statusEl.textContent = "Posting…";
      debugLog("Submitting reply…");

      try {
        const payload = {
          userId: currentUser.uid,
          pseudonym: pseudo,
          steelmanSummary: steel,
          body,
          createdAt: serverTimestamp(),
          parentReplyId: parentId,
          pinned: false,
          topicTierRequired: minWriteTierAttr
        };

        debugLog(`Payload: ${JSON.stringify(payload)}`);

        await addDoc(repliesRef, payload);

        Reputation.awardPoints(
          currentUser.uid,
          1,
          "reply",
          `Reply posted in ${topicId}`,
          topicId
        ).catch(err => debugLog(`Reputation error: ${err.message}`));

        form.reset();
        parentReplyField.value = "";
        replyContext.hidden = true;
        statusEl.textContent = "Reply posted.";

      } catch (err) {
        debugLog(`Reply ERROR: ${err.message}`);
        statusEl.textContent = "Error posting reply.";
      }
    });
  }

  // ============================================================
  // Vote ripple animations
  // ============================================================
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
});

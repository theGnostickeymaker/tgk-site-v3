// /js/community-edit.js
// TGK Community - Edit reply module (v2)
// - Aligns with new rules:
//   • Root posts: steelman optional
//   • Replies: steelman required only if intent === "challenge"
//   • Challenge replies: body must be substantive
//
// Note: Firestore security rules should enforce author or admin on write.

import { db, auth } from "/js/firebase-init.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

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

function showStatus(el, msg) {
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
}

function getTopicIdFromDom() {
  return document.querySelector("#discussion-root")?.getAttribute("data-topic-id") || null;
}

function findCard(replyId) {
  return document.querySelector(`.discussion-message[data-reply-id="${replyId}"]`);
}

function extractExistingSteelman(card) {
  // Your rendered steelman uses:
  // <div class="steelman-text">...</div>
  const steelTextEl = card.querySelector(".discussion-message-steelman .steelman-text");
  return (steelTextEl?.textContent || "").trim();
}

function extractExistingBody(card) {
  const bodyEl = card.querySelector(".discussion-message-body");
  return (bodyEl?.textContent || "").trim();
}

function enterEditMode(card, replyId, existingSteelman, existingBody) {
  card.classList.add("is-editing");

  const safeSteel = existingSteelman.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const safeBody = existingBody.replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  card.innerHTML = `
    <div class="reply-edit-wrap">
      <div class="form-group">
        <label>Steel Man Summary (optional unless Challenge reply)</label>
        <textarea class="edit-steelman" maxlength="1500" rows="3">${safeSteel}</textarea>
        <p class="small muted">Required only when editing a Challenge reply to another comment (10 to 40 words).</p>
      </div>

      <div class="form-group">
        <label>Your Reply</label>
        <textarea class="edit-body" maxlength="5000" rows="6">${safeBody}</textarea>
        <p class="small muted">Challenge replies must be at least ${RULES.challengeMinChars} characters.</p>
      </div>

      <div class="reply-edit-actions">
        <button class="btn-primary btn-save-edit" type="button" data-reply-id="${replyId}">
          Save Changes
        </button>
        <button class="btn-secondary btn-cancel-edit" type="button" data-reply-id="${replyId}">
          Cancel
        </button>
      </div>

      <p class="edit-status small muted" hidden></p>
    </div>
  `;
}

/* -----------------------------------------------------------
   Open editor
----------------------------------------------------------- */
document.addEventListener("click", async (event) => {
  const btn = event.target.closest(".btn-edit-reply");
  if (!btn) return;

  const replyId = btn.dataset.replyId;
  if (!replyId) return;

  const card = findCard(replyId);
  if (!card) return;

  const topicId = getTopicIdFromDom();
  if (!topicId) return;

  try {
    // Pull current reply data to validate edit rules correctly
    const ref = doc(db, "topics", topicId, "replies", replyId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data() || {};
    if (data.deleted) return;

    const existingSteelman = extractExistingSteelman(card);
    const existingBody = extractExistingBody(card);

    // Preserve values currently displayed (not necessarily the latest if snapshot is lagging)
    enterEditMode(card, replyId, existingSteelman, existingBody);
  } catch (err) {
    console.error("[Edit] Unable to enter edit mode:", err);
  }
});

/* -----------------------------------------------------------
   Cancel editing (simple: reload)
----------------------------------------------------------- */
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".btn-cancel-edit");
  if (!btn) return;

  location.reload();
});

/* -----------------------------------------------------------
   Save edited reply
----------------------------------------------------------- */
document.addEventListener("click", async (event) => {
  const btn = event.target.closest(".btn-save-edit");
  if (!btn) return;

  const replyId = btn.dataset.replyId;
  if (!replyId) return;

  const card = findCard(replyId);
  if (!card) return;

  const topicId = getTopicIdFromDom();
  if (!topicId) {
    const status = card.querySelector(".edit-status");
    showStatus(status, "Unable to locate topic ID.");
    return;
  }

  const status = card.querySelector(".edit-status");
  const steelField = card.querySelector(".edit-steelman");
  const bodyField = card.querySelector(".edit-body");

  const newSteel = (steelField?.value || "").trim();
  const newBody = (bodyField?.value || "").trim();

  if (!currentUser) {
    showStatus(status, "You must be signed in to edit your reply.");
    return;
  }

  try {
    const ref = doc(db, "topics", topicId, "replies", replyId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data() || {};
    if (data.deleted) {
      showStatus(status, "This reply has been removed and cannot be edited.");
      return;
    }

    const isReply = Boolean(data.parentReplyId);
    const intent = (data.intent || "reply").trim();
    const isChallengeReply = isReply && intent === "challenge";

    if (!newBody) {
      showStatus(status, "Please write something before saving.");
      return;
    }

    if (isChallengeReply) {
      if (charCount(newBody) < RULES.challengeMinChars) {
        showStatus(status, `Challenge replies must be at least ${RULES.challengeMinChars} characters.`);
        return;
      }

      const wc = wordCount(newSteel);
      if (wc < RULES.steelMinWords || wc > RULES.steelMaxWords) {
        showStatus(status, `Steel Man is required for Challenge replies and must be ${RULES.steelMinWords} to ${RULES.steelMaxWords} words.`);
        return;
      }
    } else {
      if (charCount(newBody) < RULES.normalMinChars) {
        showStatus(status, `Please write at least ${RULES.normalMinChars} characters.`);
        return;
      }
      // Steelman optional here. If present, keep it, no strict rule needed.
    }

    showStatus(status, "Saving changes...");

    await updateDoc(ref, {
      steelmanSummary: newSteel || "",
      body: newBody,
      updatedAt: serverTimestamp()
    });

    location.reload();
  } catch (err) {
    console.error("[Edit] Save failed:", err);
    showStatus(status, "Unable to save changes. Please try again.");
  }
});

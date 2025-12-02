// =============================================================
// TGK Community — Edit Reply Module
// Allows the original author to edit their contribution.
// =============================================================

import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// Global click handler for edit buttons
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("btn-edit-reply")) return;

  const replyId = event.target.dataset.replyId;
  if (!replyId) return;

  const replyCard = document.querySelector(`[data-reply-id="${replyId}"]`);
  if (!replyCard) return;

  enterEditMode(replyCard, replyId);
});

// -------------------------------------------------------------
// Enter edit mode: convert reply card into an inline editor
// -------------------------------------------------------------
function enterEditMode(card, replyId) {

  const steelEl = card.querySelector(".reply-steelman-body");
  const bodyEl = card.querySelector(".reply-body-text");

  const existingSteelman = steelEl?.textContent?.trim() || "";
  const existingBody = bodyEl?.textContent?.trim() || "";

  card.classList.add("is-editing");

  card.innerHTML = `
    <div class="reply-edit-wrap">
      <div class="form-group">
        <label>Steel Man Summary</label>
        <textarea class="edit-steelman" minlength="30" maxlength="1000" rows="3">${existingSteelman}</textarea>
      </div>

      <div class="form-group">
        <label>Your Reply</label>
        <textarea class="edit-body" minlength="20" maxlength="5000" rows="5">${existingBody}</textarea>
      </div>

      <div class="reply-edit-actions">
        <button class="btn-primary btn-save-edit" data-reply-id="${replyId}">
          Save Changes
        </button>
        <button class="btn-secondary btn-cancel-edit" data-reply-id="${replyId}">
          Cancel
        </button>
      </div>

      <p class="edit-status small muted" hidden></p>
    </div>
  `;
}

// -------------------------------------------------------------
// Cancel editing
// -------------------------------------------------------------
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("btn-cancel-edit")) return;

  const replyId = event.target.dataset.replyId;
  if (!replyId) return;

  // Reload the page to restore original content (simplest and safest)
  // A non-refresh version is also possible if you prefer
  location.reload();
});

// -------------------------------------------------------------
// Save edited reply
// -------------------------------------------------------------
document.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("btn-save-edit")) return;

  const replyId = event.target.dataset.replyId;
  const card = document.querySelector(`[data-reply-id="${replyId}"]`);
  if (!card) return;

  const steelField = card.querySelector(".edit-steelman");
  const bodyField = card.querySelector(".edit-body");
  const status = card.querySelector(".edit-status");

  const newSteel = steelField.value.trim();
  const newBody = bodyField.value.trim();

  if (newSteel.length < 30) {
    showStatus(status, "Steel Man summary is too short. Minimum 30 characters.");
    return;
  }

  if (newBody.length < 20) {
    showStatus(status, "Your reply is too short. Minimum 20 characters.");
    return;
  }

  if (!currentUser) {
    showStatus(status, "You must be signed in to edit your reply.");
    return;
  }

  const topicId = card.closest("#discussion-root")?.dataset.topicId;
  if (!topicId) {
    showStatus(status, "Unable to locate topic ID.");
    return;
  }

  const ref = doc(db, "topics", topicId, "replies", replyId);

  try {
    showStatus(status, "Saving changes...");
    await updateDoc(ref, {
      steelmanSummary: newSteel,
      body: newBody,
      updatedAt: serverTimestamp()
    });

    // Reload page to ensure clean DOM + fresh listeners
    location.reload();

  } catch (err) {
    console.error(err);
    showStatus(status, "Unable to save changes. Please try again.");
  }
});

// Utility: show temporary status message
function showStatus(el, msg) {
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
}

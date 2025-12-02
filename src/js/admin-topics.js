// ============================================================
// TGK Community — Administrator Topic Manager
// Creation, retrieval, editing, and deletion of discussion topics.
// Access restricted to administrators by Firestore rules.
// ============================================================

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let currentUser = null;

// ============================================================
// Authentication Tracking
// ============================================================
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// ============================================================
// DOM Initialisation
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initialiseTopicCreation();
  initialiseTopicEditing();
  initialiseTopicDeletion();
  loadExistingTopics();
});

// ============================================================
// Topic Creation Handler
// ============================================================
function initialiseTopicCreation() {
  const form = document.getElementById("topic-create-form");
  const statusEl = document.getElementById("topic-create-status");

  if (!form) return;

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    if (!currentUser) {
      return displayStatus(statusEl, "You must be signed in as an administrator.", true);
    }

    const id = document.getElementById("topic-id").value.trim();
    const title = document.getElementById("topic-title").value.trim();
    const desc = document.getElementById("topic-desc").value.trim();
    const glyph = document.getElementById("topic-glyph").value.trim();
    const state = document.getElementById("topic-state").value.trim();

    if (!id || !title || !desc) {
      return displayStatus(statusEl, "All fields are required.", true);
    }

    try {
      await setDoc(doc(db, "topics", id), {
        title,
        description: desc,
        glyph,
        state,
        createdAt: serverTimestamp()
      });

      displayStatus(statusEl, "Topic created successfully.", false);
      form.reset();
      loadExistingTopics();

    } catch (error) {
      console.error(error);
      displayStatus(statusEl, "Unable to create topic. Please try again.", true);
    }
  });
}

// ============================================================
// Retrieve and Display Existing Topics
// ============================================================
async function loadExistingTopics() {
  const listEl = document.getElementById("admin-topic-list");
  if (!listEl) return;

  listEl.innerHTML = "<p class='muted'>Loading topics...</p>";

  try {
    const ref = collection(db, "topics");
    const q = query(ref, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      listEl.innerHTML = "<p class='muted'>No topics are currently available.</p>";
      return;
    }

    listEl.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "admin-topic-card";

      card.innerHTML = `
        <h3>
          ${data.title || docSnap.id}
          <span class="muted small">${data.state || ""}</span>
        </h3>

        <p>${data.description || ""}</p>
        <p class="small muted">ID: ${docSnap.id}</p>

        <div class="admin-topic-actions">
          <button class="btn-secondary btn-edit-topic" data-topic-id="${docSnap.id}">
            Edit
          </button>
          <button class="btn-danger btn-delete-topic" data-topic-id="${docSnap.id}">
            Delete
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    listEl.innerHTML = "<p class='muted'>Unable to load topics.</p>";
  }
}

// ============================================================
// Topic Editing (Phase 2.4)
// ============================================================
function initialiseTopicEditing() {
  document.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("btn-edit-topic")) return;

    const topicId = event.target.dataset.topicId;
    const modal = document.getElementById("admin-edit-topic-modal");
    const statusEl = document.getElementById("admin-edit-topic-status");

    if (!topicId || !modal) return;

    try {
      const ref = doc(db, "topics", topicId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return;
      }

      const data = snap.data();

      document.getElementById("edit-topic-id").value = topicId;
      document.getElementById("edit-topic-title").value = data.title || "";
      document.getElementById("edit-topic-desc").value = data.description || "";
      document.getElementById("edit-topic-glyph").value = data.glyph || "";
      document.getElementById("edit-topic-state").value = data.state || "active";

      statusEl.hidden = true;
      modal.hidden = false;

    } catch (error) {
      console.error(error);
    }
  });

  const saveBtn = document.getElementById("admin-edit-topic-save");
  const cancelBtn = document.getElementById("admin-edit-topic-cancel");

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      const modal = document.getElementById("admin-edit-topic-modal");
      if (modal) modal.hidden = true;
    };
  }

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const topicId = document.getElementById("edit-topic-id").value;
      const statusEl = document.getElementById("admin-edit-topic-status");

      const updated = {
        title: document.getElementById("edit-topic-title").value.trim(),
        description: document.getElementById("edit-topic-desc").value.trim(),
        glyph: document.getElementById("edit-topic-glyph").value.trim(),
        state: document.getElementById("edit-topic-state").value.trim(),
        updatedAt: serverTimestamp()
      };

      try {
        await updateDoc(doc(db, "topics", topicId), updated);
        statusEl.hidden = false;
        statusEl.textContent = "Topic updated successfully.";
        setTimeout(() => location.reload(), 800);

      } catch (error) {
        console.error(error);
        statusEl.hidden = false;
        statusEl.textContent = "Unable to update topic.";
      }
    };
  }
}

// ============================================================
// Topic Deletion (Phase 2.4)
// ============================================================
function initialiseTopicDeletion() {
  document.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("btn-delete-topic")) return;

    const topicId = event.target.dataset.topicId;
    if (!topicId) return;

    const confirmed = window.confirm(
      "Are you certain you wish to delete this topic? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "topics", topicId));
      location.reload();

    } catch (error) {
      console.error(error);
      alert("Unable to delete topic.");
    }
  });
}

// ============================================================
// Utility: Display Status Message
// ============================================================
function displayStatus(element, message, isError) {
  if (!element) return;

  element.hidden = false;
  element.textContent = message;
  element.style.color = isError
    ? "var(--danger)"
    : "var(--success)";
}

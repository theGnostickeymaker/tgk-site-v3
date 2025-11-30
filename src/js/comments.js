// ===========================================================
// 💬 TGK — Firebase Comment Engine (v1.0)
// Requires: firebase-init.js to export app
// ===========================================================

import { app } from "/js/firebase-init.js";
import {
  getFirestore, collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Identify scroll by URL
const scrollId = window.location.pathname.replace(/\//g, "_");

// DOM refs
const signinPanel = document.getElementById("comments-signin-panel");
const form = document.getElementById("comments-form");
const list = document.getElementById("comments-list");
const pinned = document.getElementById("pinned-comment");

const txtSteelman = document.getElementById("comment-steelman");
const txtComment = document.getElementById("comment-text");
const btnSubmit = document.getElementById("comment-submit");

// -----------------------------------------------------------
// INITIALISE
// -----------------------------------------------------------

onAuthStateChanged(auth, user => {
  if (user) {
    signinPanel.style.display = "none";
    form.style.display = "block";
    loadComments();
  } else {
    signinPanel.style.display = "block";
    form.style.display = "none";
  }
});

// -----------------------------------------------------------
// LOAD COMMENTS
// -----------------------------------------------------------

function loadComments() {
  const q = query(
    collection(db, "comments", scrollId, "items"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, snapshot => {
    let html = "";
    let pinnedComment = null;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.isPinned) {
        pinnedComment = renderComment(data);
      } else {
        html += renderComment(data);
      }
    });

    if (pinnedComment) {
      pinned.innerHTML = pinnedComment;
      pinned.style.display = "block";
    } else {
      pinned.style.display = "none";
    }

    list.innerHTML = html;
  });
}

// -----------------------------------------------------------
// RENDER COMMENT
// -----------------------------------------------------------

function renderComment(data) {
  const date = data.timestamp?.toDate().toLocaleString("en-GB") || "";
  return `
    <div class="comment-item ${data.isPinned ? "comment-pinned" : ""}">
      <div class="comment-meta">
        <strong>${data.authorName || "Anonymous Seeker"}</strong>
        <span class="muted">• ${date}</span>
      </div>

      <div class="comment-steelman">
        <em>Steel Man:</em>
        <p>${escapeHTML(data.steelman || "")}</p>
      </div>

      <div class="comment-body">
        <p>${escapeHTML(data.content)}</p>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------
// SUBMIT COMMENT
// -----------------------------------------------------------

btnSubmit?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const steel = txtSteelman.value.trim();
  const msg = txtComment.value.trim();

  if (!steel || !msg) {
    alert("Please write both a steelman summary and a reply.");
    return;
  }

  await addDoc(collection(db, "comments", scrollId, "items"), {
    authorId: user.uid,
    authorName: user.displayName || "Seeker",
    steelman: steel,
    content: msg,
    timestamp: serverTimestamp(),
    isPinned: false
  });

  txtSteelman.value = "";
  txtComment.value = "";
});

// -----------------------------------------------------------
// Utility
// -----------------------------------------------------------

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[m]));
}

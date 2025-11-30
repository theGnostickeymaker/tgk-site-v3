// /js/discussion-topic.js

// Adjust these imports to match your existing Firebase setup.
import { getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";

const app = getApp();                // assumes app already initialised elsewhere
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("discussion-root");
  if (!root) return;

  const topicId = root.getAttribute("data-topic-id");
  if (!topicId) return;

  const form = document.getElementById("discussion-form");
  const statusEl = document.getElementById("discussion-status");
  const authHintEl = document.getElementById("discussion-auth-hint");
  const messagesEl = document.getElementById("discussion-messages");

  let currentUser = null;
  let currentPseudonym = null;

  // Track auth state
  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;

    if (!user) {
      if (authHintEl) {
        authHintEl.textContent =
          "You are currently signed out. Sign in to your TGK account to post.";
      }
      if (form) form.classList.add("is-disabled");
    } else {
      if (authHintEl) {
        authHintEl.textContent =
          "You are signed in. Your contribution will appear with your pseudonym.";
      }
      if (form) form.classList.remove("is-disabled");
      // You can optionally fetch the saved pseudonym from /users/{uid} here.
    }
  });

  // Load replies for this topic
  const repliesRef = collection(db, "topics", topicId, "replies");
  const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));

  onSnapshot(repliesQuery, (snapshot) => {
    if (!messagesEl) return;

    if (snapshot.empty) {
      messagesEl.innerHTML = `
        <p class="muted small">
          No contributions yet. Be the first to offer a Steel Man summary.
        </p>
      `;
      return;
    }

    messagesEl.innerHTML = "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      const container = document.createElement("article");
      container.className = "discussion-message";

      const header = document.createElement("div");
      header.className = "discussion-message-header";

      const author = document.createElement("span");
      author.className = "discussion-message-author";
      author.textContent = data.pseudonym || "Anonymous Seeker";

      const meta = document.createElement("span");
      meta.className = "discussion-message-meta";
      const ts = data.createdAt?.toDate?.() || null;
      meta.textContent = ts
        ? ts.toLocaleString()
        : "Pending timestamp";

      header.appendChild(author);
      header.appendChild(meta);

      const steel = document.createElement("div");
      steel.className = "discussion-message-steelman";
      steel.textContent = data.steelmanSummary || "";

      const body = document.createElement("div");
      body.className = "discussion-message-body";
      body.textContent = data.body || "";

      container.appendChild(header);
      if (data.steelmanSummary) container.appendChild(steel);
      container.appendChild(body);

      messagesEl.appendChild(container);
    });
  });

  // Handle submit
  if (form) {
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      if (!currentUser) {
        if (statusEl) {
          statusEl.textContent = "You must be signed in to post.";
        }
        return;
      }

      const steelField = form.querySelector("#steelman-summary");
      const bodyField = form.querySelector("#reply-body");
      const pseudoField = form.querySelector("#pseudonym");

      const steelText = steelField?.value.trim() || "";
      const bodyText = bodyField?.value.trim() || "";
      const pseudoText = pseudoField?.value.trim() || "";

      if (steelText.split(/\s+/).length < 30) {
        if (statusEl) {
          statusEl.textContent =
            "Your Steel Man summary is too short. Aim for at least 30 words.";
        }
        return;
      }

      if (bodyText.split(/\s+/).length < 20) {
        if (statusEl) {
          statusEl.textContent =
            "Your response is too short. Aim for at least 20 words.";
        }
        return;
      }

      if (statusEl) statusEl.textContent = "Posting reply...";

      try {
        await addDoc(repliesRef, {
          userId: currentUser.uid,
          pseudonym: pseudoText || currentPseudonym || "Anonymous Seeker",
          steelmanSummary: steelText,
          body: bodyText,
          createdAt: serverTimestamp(),
          parentReplyId: null
        });

        steelField.value = "";
        bodyField.value = "";
        // Do not wipe pseudonym every time

        if (statusEl) {
          statusEl.textContent = "Reply posted.";
        }
      } catch (err) {
        console.error(err);
        if (statusEl) {
          statusEl.textContent =
            "There was a problem posting your reply. Please try again.";
        }
      }
    });
  }
});

/* ===========================================================
   🔖 TGK — Bookmarks.js (v2.4)
   Hybrid Local + Firestore + Visual Feedback + Animations + Toasts
   =========================================================== */

import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection
} from "firebase/firestore";
import { app } from "./firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);
const localKey = "tgk_bookmarks";

/* ✦ Helper delay */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ===========================================================
   🔔 TGK Toast Helper
   =========================================================== */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `tgk-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-remove after animation ends
  setTimeout(() => toast.remove(), 4000);
}

/* ===========================================================
   ✦ Toggle Bookmark — Local + Remote + Animation
   =========================================================== */
export async function toggleBookmark(scrollId, button) {
  const uid = auth.currentUser?.uid;
  const ls = JSON.parse(localStorage.getItem(localKey) || "[]");
  const hasLocal = ls.includes(scrollId);

  // Instant local feedback
  const updated = hasLocal ? ls.filter((i) => i !== scrollId) : [...ls, scrollId];
  localStorage.setItem(localKey, JSON.stringify(updated));

  // === Visual feedback logic ===
  if (button) {
    if (hasLocal) {
      // 🩸 Removal pulse (red dissolve)
      button.classList.add("removing");
      button.classList.remove("bookmarked");
      button.title = "Add to bookmarks";
      showToast("🩸 Removed from Dashboard", "remove");
      await sleep(450); // allow animation to finish
      button.classList.remove("removing");
    } else {
      // ✨ Add pulse (green bounce)
      button.classList.add("bookmarked");
      button.title = "Saved to dashboard";
      button.animate([{ transform: "scale(1.4)" }, { transform: "scale(1)" }], {
        duration: 200,
        easing: "ease-out"
      });
      showToast("🔖 Saved to Dashboard", "success");
    }
  }

  // === Firestore sync (if logged in) ===
  if (!uid) return;
  const ref = doc(db, "bookmarks", uid, "scrolls", scrollId);

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // 🧹 Remove bookmark from Firestore
      await deleteDoc(ref);

      // ✦ Dashboard fade-out if visible
      const dashItem = document.querySelector(
        `[data-scroll="${scrollId}"], li[data-id="${scrollId}"]`
      );
      if (dashItem) {
        dashItem.classList.add("removing");
        await sleep(400); // match CSS duration
        dashItem.remove();
      }
    } else {
      // ✨ Add new bookmark
      await setDoc(ref, { created: Date.now() });
    }
  } catch (err) {
    console.error("[TGK] Bookmark Firestore error:", err);
  }
}

/* ===========================================================
   ✦ Sync remote → local (on login)
   =========================================================== */
export async function syncBookmarks() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    const remote = [];
    const qSnap = await getDocs(collection(db, "bookmarks", uid, "scrolls"));
    qSnap.forEach((d) => remote.push(d.id));
    localStorage.setItem(localKey, JSON.stringify(remote));
    console.log(`[TGK] Synced ${remote.length} bookmarks`);

    // Update visual state globally
    document.querySelectorAll(".scroll-bookmark").forEach((btn) => {
      const id = btn.dataset.bookmarkId;
      if (remote.includes(id)) btn.classList.add("bookmarked");
      else btn.classList.remove("bookmarked");
    });
  } catch (err) {
    console.error("[TGK] Bookmark sync error:", err);
  }
}

/* ===========================================================
   ✦ Initialize buttons on page load
   =========================================================== */
export function initBookmarks() {
  const buttons = document.querySelectorAll(".scroll-bookmark");
  if (!buttons.length) return;

  const ls = JSON.parse(localStorage.getItem(localKey) || "[]");

  buttons.forEach((btn) => {
    const id = btn.dataset.bookmarkId;
    if (ls.includes(id)) btn.classList.add("bookmarked");

    btn.addEventListener("click", () => toggleBookmark(id, btn));
  });

  // Auto-sync when logged in
  onAuthStateChanged(auth, (user) => {
    if (user) syncBookmarks();
  });
}

/* ✦ Auto-init if present */
document.addEventListener("DOMContentLoaded", initBookmarks);

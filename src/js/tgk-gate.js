/* ===========================================================
   TGK — Unified Gate v3.9.2
   Early Export + Verified Return + Unlock + Toast
   =========================================================== */

import { app } from "/js/firebase-init.js";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
const RETURN_KEY = "tgk-return-url";
const tierRank = { free: 0, initiate: 1, adept: 2, admin: 3 };

/* ===========================================================
   🜂 EARLY EXPORT — ensures Auth can consume Gate immediately
   =========================================================== */
export function saveReturnUrl(url = window.location.href) {
  if (!url.startsWith(window.location.origin)) return;
  if (url === window.location.origin + "/" || url.includes("/index.html")) return;
  sessionStorage.setItem(RETURN_KEY, url);
  localStorage.setItem(RETURN_KEY, url);
  console.log("[Gate] Saved return URL:", url);
}

export function consumeReturnUrl() {
  const url = sessionStorage.getItem(RETURN_KEY) || localStorage.getItem(RETURN_KEY);
  if (!url || !url.startsWith(window.location.origin)) return false;

  sessionStorage.removeItem(RETURN_KEY);
  localStorage.removeItem(RETURN_KEY);
  sessionStorage.setItem("tgk-returned", "1");

  console.log("[Gate] Returning to:", url);
  setTimeout(() => window.location.replace(url), 200); // delay prevents Firebase race
  return true;
}

// Make globally accessible for Auth
window.__TGK_GATE__ = { saveReturnUrl, consumeReturnUrl };

/* ===========================================================
   🜂 Toast Helper + Return Notification
   =========================================================== */
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "tgk-toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 50);
  setTimeout(() => toast.classList.remove("visible"), 4000);
  setTimeout(() => toast.remove(), 4500);
}

if (sessionStorage.getItem("tgk-returned")) {
  setTimeout(() => {
    showToast("🗝️ Welcome back. Scroll unlocked.");
    sessionStorage.removeItem("tgk-returned");
  }, 350);
}

/* ===========================================================
   🜂 Init Gate — Unlock + Click Logic
   =========================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGate);
} else {
  initGate();
}

function initGate() {
  console.log("[Gate] Initialising...");

  const lockedBlocks = document.querySelectorAll(".locked-page");
  if (!lockedBlocks.length) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("[Gate] No user — locked UI stays.");
      return;
    }

    try {
      await user.getIdToken(true);
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      const userTier = claims.tier || localStorage.getItem("tgk-tier") || "free";
      const rank = tierRank[userTier] ?? 0;

      lockedBlocks.forEach((block) => {
        const reqTier = block.dataset.requiredTier || "initiate";
        const reqRank = tierRank[reqTier] ?? 1;
        if (rank >= reqRank) {
          block.classList.add("unlocked-page");
          block.querySelector(".locked-placeholder")?.remove();
          block.querySelector(".page-content")?.style.setProperty("display", "block");
          console.log("[Gate] Unlocked:", block.id || block.className);
        } else {
          console.log("[Gate] Insufficient tier:", userTier);
        }
      });
    } catch (err) {
      console.error("[Gate] Token error:", err);
    }
  });

  // === "Sign In" button
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".signin-btn");
    if (!btn) return;
    e.preventDefault();
    saveReturnUrl();
    window.location.href = "/signin/";
  });

  // === "Join Now" button
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".join-btn");
    if (!btn) return;
    e.preventDefault();
    saveReturnUrl();
    window.location.href = "/signup/";
  });
}

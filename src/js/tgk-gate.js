/* ===========================================================
   TGK — Unified Gate v3.8 — FINAL (CLICK + UNLOCK + CLAIMS)
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

// === SAVE / CONSUME RETURN URL ===
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
  console.log("[Gate] Returning to:", url);
  window.location.replace(url);
  return true;
}

window.__TGK_GATE__ = { saveReturnUrl, consumeReturnUrl };

// === DOM READY: Unlock + Click Handler ===
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGate);
} else {
  initGate();
}

function initGate() {
  console.log("[Gate] Initializing...");

  const lockedBlocks = document.querySelectorAll(".locked-page");
  if (!lockedBlocks.length) return;

  // === 1. UNLOCK CONTENT IF LOGGED IN ===
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("[Gate] No user — showing locked UI");
      return;
    }

    console.log("[Gate] User detected:", user.email, user.uid);

    try {
      // FORCE REFRESH TOKEN TO GET LATEST CLAIMS
      await user.getIdToken(true);
      console.log("[Gate] Token refreshed — claims loaded");

      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      console.log("[Gate] Claims:", claims);

      // Normalize tier to lowercase
      const rawTier = claims.tier || localStorage.getItem("tgk-tier") || "free";
      const userTier = rawTier.toString().toLowerCase();
      localStorage.setItem("tgk-tier", userTier); // persist
      console.log("[Gate] User tier:", userTier);

      const rank = tierRank[userTier] ?? 0;

      lockedBlocks.forEach(block => {
        const reqTier = (block.dataset.requiredTier || "initiate").toLowerCase();
        const reqRank = tierRank[reqTier] ?? 1;
        console.log(`[Gate] Block requires: ${reqTier} (rank ${reqRank}), user has rank ${rank}`);

        if (rank >= reqRank) {
          console.log("[Gate] UNLOCKING BLOCK");
          block.classList.add("unlocked-page");
          block.querySelector(".locked-placeholder")?.remove();
          const content = block.querySelector(".page-content");
          if (content) {
            content.style.display = "block";
            content.style.opacity = "1";
          }
        } else {
          console.log("[Gate] Access denied — tier too low");
        }
      });
    } catch (err) {
      console.error("[Gate] Token error:", err);
    }
  });

  // === 2. CLICK: "Sign In" button ===
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".signin-btn");
    if (!btn) return;

    console.log("[Gate] Sign In button clicked");
    e.preventDefault();
    e.stopPropagation();
    saveReturnUrl();
    window.location.href = "/signin/";
  });
}
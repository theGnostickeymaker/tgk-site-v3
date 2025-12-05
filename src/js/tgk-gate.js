/* ===========================================================
   TGK — Gate System v8.0
   Claims First, Unlock Stable, Full Return URL Support
   =========================================================== */

import { app } from "/js/firebase-init.js";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
const RETURN_KEY = "tgk-return-url";

const tierRank = {
  free: 0,
  initiate: 1,
  adept: 2,
  admin: 3,
};

export function saveReturnUrl(url = window.location.href) {
  if (!url.startsWith(window.location.origin)) return;
  if (url.endsWith("/") || url.includes("/index.html")) return;

  sessionStorage.setItem(RETURN_KEY, url);
  localStorage.setItem(RETURN_KEY, url);

  console.log("[Gate] Saved return URL:", url);
}

export function consumeReturnUrl() {
  const url =
    sessionStorage.getItem(RETURN_KEY) ||
    localStorage.getItem(RETURN_KEY);

  if (!url || !url.startsWith(window.location.origin)) return false;

  sessionStorage.removeItem(RETURN_KEY);
  localStorage.removeItem(RETURN_KEY);

  console.log("[Gate] Returning to:", url);
  window.location.replace(url);
  return true;
}

window.__TGK_GATE__ = { saveReturnUrl, consumeReturnUrl };

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGate);
} else {
  initGate();
}

function initGate() {
  console.log("[Gate] Initialising…");

  const locked = document.querySelectorAll(".locked-page");
  if (!locked.length) return;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      await user.getIdToken(true);
      const tk = await getIdTokenResult(user);
      const claims = tk.claims;

      const tier = claims.tier || localStorage.getItem("tgk-tier") || "free";
      if (claims.tier) localStorage.setItem("tgk-tier", claims.tier);

      const rank = tierRank[tier] ?? 0;

      locked.forEach((block) => {
        const req = block.dataset.requiredTier || "initiate";
        const reqRank = tierRank[req] ?? 1;

        if (rank >= reqRank) {
          block.classList.add("unlocked-page");
          block.querySelector(".locked-placeholder")?.remove();

          const content = block.querySelector(".page-content");
          if (content) {
            content.style.display = "block";
            content.style.opacity = "1";
          }
        }
      });

    } catch (err) {
      console.error("[Gate] Claim check failed:", err);
    }
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".signin-btn");
    if (!btn) return;

    e.preventDefault();
    saveReturnUrl();
    window.location.href = "/signin/";
  });
}

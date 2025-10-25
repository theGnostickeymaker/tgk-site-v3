/* ===========================================================
   🜂 TGK — Visibility Gates (Hybrid Auth + Claim Unlock)
   Works alongside cookie-based gate.js
   =========================================================== */

import { app } from "/js/firebase-init.js"; // ✅ use shared instance
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
const tierRank = { free: 0, initiate: 1, adept: 2, admin: 3 };

document.addEventListener("DOMContentLoaded", () => {
  const lockedBlocks = document.querySelectorAll(".locked-scroll");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return; // anonymous stays locked

    try {
      const token = await getIdTokenResult(user);
      const userTier =
        token.claims.tier || localStorage.getItem("tgk-tier") || "free";
      const rank = tierRank[userTier] || 0;

      console.log(`[TGK Gate] Tier detected: ${userTier}`);

      lockedBlocks.forEach((block) => {
        const requiredTier = block.dataset.requiredTier || "initiate";
        const reqRank = tierRank[requiredTier] || 1;

        if (rank >= reqRank) {
          // 🔓 Unlock visually
          block.classList.add("unlocked-scroll");

          const placeholder = block.querySelector(".locked-placeholder");
          const content = block.querySelector(".scroll-content");

          if (placeholder) placeholder.style.display = "none";
          if (content) {
            content.style.display = "block";
            content.style.opacity = "1";
            content.style.filter = "none";
          }

          console.log(`[TGK Gate] ✅ Unlocked: ${userTier} >= ${requiredTier}`);

          // 👁 Optional toast notification
          const toast = document.createElement("div");
          toast.textContent = `🔓 Unlocked: ${userTier} access`;
          Object.assign(toast.style, {
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            padding: "0.6rem 1rem",
            background: "var(--accent)",
            color: "#000",
            borderRadius: "8px",
            fontWeight: "600",
            zIndex: "9999",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            transition: "opacity 0.4s ease"
          });
          document.body.appendChild(toast);
          setTimeout(() => (toast.style.opacity = "0"), 1500);
          setTimeout(() => toast.remove(), 2000);
        } else {
          console.log(
            `[TGK Gate] 🔒 Still locked: ${userTier} < ${requiredTier}`
          );
        }
      });
    } catch (err) {
      console.error("[TGK Gate] Claim check failed:", err);
    }
  });
});

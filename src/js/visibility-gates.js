/* ===========================================================
   🜂 TGK — Visibility Gates (Hybrid Auth + Claim Unlock)
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

/* === 🔑 Live Firebase Config === */
const firebaseConfig = {
  apiKey: "AIzaSyDYrFIw9I3hManf1TqvP6FARZTC-MlMuz0",
  authDomain: "the-gnostic-key.firebaseapp.com",
  projectId: "the-gnostic-key",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* === 🜂 Gate Map === */
const tierRank = { free: 0, initiate: 1, adept: 2, admin: 3 };

/* === 🜂 Main === */
document.addEventListener("DOMContentLoaded", () => {
  const lockedBlocks = document.querySelectorAll(".locked-scroll");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return; // still locked for anonymous

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
          block.classList.remove("locked-scroll");
          block.classList.add("unlocked-scroll");
          console.log(
            `[TGK Gate] ✅ Unlocked: ${userTier} >= ${requiredTier}`
          );
        } else {
          console.log(`[TGK Gate] 🔒 Still locked: ${userTier} < ${requiredTier}`);
        }
      });
    } catch (err) {
      console.error("[TGK Gate] Claim check failed:", err);
    }
  });
});

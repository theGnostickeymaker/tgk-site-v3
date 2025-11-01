/* ===========================================================
   TGK — account.js (v4.4 — Final Claims Fix)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

console.log("[TGK Account] Ready");

/* ===========================================================
   Force Claims Refresh — REQUIRED
   =========================================================== */
async function forceClaimsRefresh() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await user.getIdToken(true); // ← FORCES NEW TOKEN WITH CLAIMS
    console.log("[TGK Account] ID token refreshed — claims loaded");
  } catch (err) {
    console.warn("[TGK Account] Token refresh failed:", err.message);
  }
}

/* ===========================================================
   Load Tier from Firebase Claims
   =========================================================== */
async function loadTierFromClaims() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const idTokenResult = await user.getIdTokenResult();
    const tier = idTokenResult.claims.tier || "free";
    const role = idTokenResult.claims.role || "user";

    const tierEl = document.getElementById("tier");
    if (tierEl) {
      tierEl.textContent = `Your access: ${tier.toUpperCase()} (${role})`;
      tierEl.style.color = tier === "admin" ? "var(--gold)" : "inherit";
    }

    console.log(`[TGK Account] Tier from claims: ${tier} (${role})`);
  } catch (err) {
    console.error("[TGK Account] Claims load error:", err);
    document.getElementById("tier").textContent = "Error";
  }
}

/* ===========================================================
   Auth Watcher — FINAL
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await user.reload();           // Optional: user metadata
    await forceClaimsRefresh();    // ← REQUIRED: claims
    await loadTierFromClaims();    // ← Now shows initiate
    await loadProfile(user);
    setupManageButton();
    setupPasswordReset();
    setupLogout();
  } else {
    window.location.href = "/signin/";
  }
});
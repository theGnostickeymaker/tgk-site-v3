/* ===========================================================
   TGK — Verify Banner Module v1.0
   Lightweight, token-aware email verification banner
   =========================================================== */

import {
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

/**
 * Initialise verification banner listener
 * @param {object} auth - Firebase Auth instance
 */
export function initVerifyBanner(auth) {
  if (!auth) {
    console.error("[VerifyBanner] Auth instance not provided.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    await user.reload();

    if (!user.emailVerified) {
      console.log("[VerifyBanner] User not verified:", user.email);
      showVerifyBanner(user);
    } else {
      removeVerifyBanner();
    }
  });
}

/**
 * Create and display the banner
 */
function showVerifyBanner(user) {
  if (document.getElementById("verify-banner")) return;

  const banner = document.createElement("div");
  banner.id = "verify-banner";
  banner.innerHTML = `
    <span>Your email has not been verified.</span>
    <button id="resend-link">Resend verification link</button>
  `;

  document.body.prepend(banner);

  const resendBtn = banner.querySelector("#resend-link");
  resendBtn.addEventListener("click", async () => {
    try {
      await sendEmailVerification(user);
      banner.innerHTML = `<span>Verification link sent to ${user.email}.</span>`;
      console.log("[VerifyBanner] Email re-sent successfully.");
    } catch (err) {
      console.error("[VerifyBanner] Resend failed:", err);
      banner.innerHTML = `<span>Could not send verification link: ${err.message}</span>`;
    }
  });
}

/**
 * Remove banner if it exists
 */
function removeVerifyBanner() {
  const existing = document.getElementById("verify-banner");
  if (existing) existing.remove();
}

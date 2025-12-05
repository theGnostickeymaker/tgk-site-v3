/* ===========================================================
   TGK — Verify Banner Module v1.1 (Restored & Corrected)
   Lightweight, token-aware email verification banner
   Safe for global inclusion
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);

/**
 * Watch auth state and control the banner
 */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    removeVerifyBanner();
    return;
  }

  try {
    await user.reload();
  } catch (err) {
    console.warn("[VerifyBanner] Reload failed:", err.message);
  }

  if (!user.emailVerified) {
    showVerifyBanner(user);
  } else {
    removeVerifyBanner();
  }
});

/**
 * Display the verification banner
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
      banner.innerHTML = `<span>Could not send link: ${err.message}</span>`;
    }
  });
}

/**
 * Remove the banner if present
 */
function removeVerifyBanner() {
  const banner = document.getElementById("verify-banner");
  if (banner) banner.remove();
}

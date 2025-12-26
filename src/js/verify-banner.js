/* ===========================================================
   TGK Verify Banner Module v1.2
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
    console.warn("[VerifyBanner] Reload failed:", err?.message || err);
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
  const existing = document.getElementById("verify-banner");
  if (existing) return;

  const banner = document.createElement("div");
  banner.id = "verify-banner";
  banner.innerHTML = `
    <div class="verify-banner-inner">
      <span>Your email is not verified.</span>
      <div class="verify-banner-actions">
        <button id="resend-link" type="button">Resend link</button>
        <button id="refresh-verify" type="button">I have verified, refresh</button>
      </div>
    </div>
  `;

  document.body.prepend(banner);

  const resendBtn = banner.querySelector("#resend-link");
  resendBtn.addEventListener("click", async () => {
    resendBtn.disabled = true;
    const original = resendBtn.textContent;
    resendBtn.textContent = "Sending...";

    try {
      await sendEmailVerification(user);
      note(banner, `Verification link sent to ${user.email}.`);
      console.log("[VerifyBanner] Email re-sent successfully.");
    } catch (err) {
      console.error("[VerifyBanner] Resend failed:", err);
      note(banner, `Could not send link: ${err?.message || err}`);
    } finally {
      resendBtn.disabled = false;
      resendBtn.textContent = original || "Resend link";
    }
  });

  const refreshBtn = banner.querySelector("#refresh-verify");
  refreshBtn.addEventListener("click", async () => {
    refreshBtn.disabled = true;
    const original = refreshBtn.textContent;
    refreshBtn.textContent = "Checking...";

    try {
      await user.reload();
      await user.getIdToken(true);

      if (user.emailVerified) {
        removeVerifyBanner();
        window.location.reload();
        return;
      }

      note(banner, "Not verified yet. Please click the link in your email, then try again.");
    } catch (err) {
      note(banner, `Could not refresh state: ${err?.message || err}`);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.textContent = original || "I have verified, refresh";
    }
  });
}

function note(host, text) {
  const el = document.createElement("div");
  el.className = "verify-banner-note";
  el.textContent = text;
  host.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

/**
 * Remove the banner if present
 */
function removeVerifyBanner() {
  const banner = document.getElementById("verify-banner");
  if (banner) banner.remove();
}

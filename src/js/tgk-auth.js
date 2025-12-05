/* ===========================================================
   TGK — Auth Pages (Sign-in / Sign-up) v3.8 — Gate + Verify
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);

/* ===========================================================
   🜂 Persistence + Auth State Watcher
   =========================================================== */

await setPersistence(auth, browserLocalPersistence);
console.log("[Auth] Persistence set to browserLocalPersistence");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("[Auth] No user signed in.");
    removeVerifyBanner();
    return;
  }

  console.log("[Auth] onAuthStateChanged:", user.email);

  // Make sure we have current verification state
  try {
    await user.reload();
  } catch (err) {
    console.warn("[Auth] Could not reload user:", err.message);
  }

  if (!user.emailVerified) {
    console.warn("[Auth] Email not verified:", user.email);
    showVerifyBanner(user);
  } else {
    console.log("[Auth] Email verified:", user.email);
    removeVerifyBanner();
  }
});

/* ===========================================================
   🜂 Gate Integration (consumeReturnUrl)
   =========================================================== */

let consumeReturnUrl = () => false;

const ensureGate = () => {
  if (window.__TGK_GATE__?.consumeReturnUrl) {
    consumeReturnUrl = window.__TGK_GATE__.consumeReturnUrl;
  } else {
    setTimeout(ensureGate, 50);
  }
};
ensureGate();

/* ===========================================================
   🜂 Utilities
   =========================================================== */

const normaliseEmail = (e) => (e || "").trim().toLowerCase();

// === Friendly Error Messages (TGK standard) ===
const friendlyErrors = {
  "auth/user-not-found": "No account exists with that email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment before trying again.",
  "auth/email-already-in-use": "An account already exists with that email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/network-request-failed": "Network error. Please check your connection and try again."
};

function showLoginStatus(code, fallback) {
  const statusEl = document.getElementById("login-status");
  if (!statusEl) return;

  const msg = friendlyErrors[code] || fallback || "Unable to log in.";
  statusEl.textContent = msg;
  statusEl.classList.remove("hidden");
}

/* ===========================================================
   SIGN IN
   =========================================================== */

window.pageSignin = async (email, password) => {
  console.log("[Auth] pageSignin called");
  try {
    const cred = await signInWithEmailAndPassword(auth, normaliseEmail(email), password);
    console.log("[Auth] Signed in:", cred.user.email);

    // STEP 1: Sync claims
    const token = await cred.user.getIdToken();
    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    console.log("[Auth] set-entitlements response:", data);

    // STEP 2: Refresh token to apply claims
    await cred.user.getIdToken(true);
    console.log("[Auth] Token refreshed — claims now active");

    // STEP 3: Store tier locally
    if (data.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      console.log("[Auth] localStorage.tgk-tier set:", data.tier);
    }

    // STEP 4: Honour saved return URL, else go to dashboard
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    console.error("[Auth] Login failed:", err.code, err.message);

    const ignorableErrors = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-closed-by-user",
      "auth/popup-blocked"
    ];

    if (!ignorableErrors.includes(err.code)) {
      showLoginStatus(err.code, err.message);
    } else {
      console.warn("[Auth] Non-critical sign-in error suppressed:", err.code);
    }
  }
};

/* ===========================================================
   SIGN UP
   =========================================================== */

let signupLock = false;

window.pageSignup = async (email, password) => {
  if (signupLock) return;
  signupLock = true;

  try {
    // 1. Validate password before doing anything else
    const passwordPolicy = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const failed = Object.entries(passwordPolicy)
      .filter(([_, valid]) => !valid)
      .map(([key]) => key);

    if (failed.length > 0) {
      alert(
        "Password must include:\n" +
        "- At least 8 characters\n" +
        "- Uppercase, lowercase, number, and special character."
      );
      return;
    }

    // 2. Create Firebase user
    const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");
    const cred = await createUserWithEmailAndPassword(auth, normaliseEmail(email), password);
    const user = cred.user;

    // 3. Send verification email with dashboard return URL
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard/?verify=1`,
        handleCodeInApp: false
      };
      await sendEmailVerification(user, actionCodeSettings);
      console.log("[Auth] Verification email sent to:", user.email);
    } catch (verr) {
      console.warn("[Auth] Could not send verification email:", verr.message);
    }

    // 4. Create / link Stripe customer on free tier
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: normaliseEmail(email),
        priceId: "price_1SSbN52NNS39COWZzEg9tTWn" // LIVE Free Tier ID from Stripe
      })
    });

    if (!res.ok) throw new Error((await res.json()).error || "Checkout session failed");

    const { customerId } = await res.json();

    // 5. Sync entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, customerId, email: normaliseEmail(email) })
    });

    // 6. Refresh token + local tier
    await user.getIdToken(true);
    localStorage.setItem("tgk-tier", "initiate");

    alert("Welcome to The Gnostic Key! We have sent a quick verification link to your email — you can explore right away, but please confirm later to secure your access.");

    // 7. Return to locked page if gate saved one; else dashboard
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    console.error("[Auth] Signup failed:", err.code, err.message);

    const ignorableErrors = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-closed-by-user",
      "auth/popup-blocked"
    ];

    if (!ignorableErrors.includes(err.code)) {
      showLoginStatus(err.code, err.message);
    } else {
      console.warn("[Auth] Non-critical sign-up error suppressed:", err.code);
    }
  } finally {
    signupLock = false;
  }
};

/* ===========================================================
   PASSWORD RESET
   =========================================================== */

function pageReset(email) {
  const addr = normaliseEmail(email);
  if (!addr.includes("@")) return alert("Invalid email.");
  sendPasswordResetEmail(auth, addr)
    .then(() => alert("Reset link sent."))
    .catch(e => alert("Error: " + e.message));
}

/* ===========================================================
   BIND FORMS
   =========================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindForms);
} else {
  bindForms();
}

function bindForms() {
  console.log("[Auth] Binding forms...");

  // === Sign In Form ===
  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signinForm.querySelector("#signin-email")?.value;
      const pw = signinForm.querySelector("#signin-password")?.value;
      if (email && pw) {
        console.log("[Auth] Submitting sign-in...");
        pageSignin(email, pw);
      }
    });
  }

  // === Sign Up Form ===
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm.querySelector("#signup-email")?.value;
      const pw = signupForm.querySelector("#signup-password")?.value;
      if (email && pw) {
        console.log("[Auth] Submitting sign-up...");
        pageSignup(email, pw);
      } else {
        alert("Please enter both email and password.");
      }
    });
  }

  // === Password Reset Link ===
  document.getElementById("reset-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter your email:");
    if (email) pageReset(email);
  });
}

/* ===========================================================
   EMAIL VERIFICATION BANNER (TGK Integrated)
   =========================================================== */

function showVerifyBanner(user) {
  if (!user) return;
  if (document.getElementById("verify-banner")) return;

  const banner = document.createElement("div");
  banner.id = "verify-banner";
  banner.innerHTML = `
    <span>Your email has not been verified.</span>
    <button id="resend-link">Resend verification link</button>
  `;

  document.body.prepend(banner);

  const resendBtn = banner.querySelector("#resend-link");
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/dashboard/?verify=1`,
          handleCodeInApp: false
        };
        await sendEmailVerification(user, actionCodeSettings);
        banner.innerHTML = `<span>Verification link sent to ${user.email}.</span>`;
        console.log("[VerifyBanner] Email re-sent successfully.");
      } catch (err) {
        console.error("[VerifyBanner] Resend failed:", err);
        banner.innerHTML = `<span>Could not send verification link: ${err.message}</span>`;
      }
    });
  }
}

function removeVerifyBanner() {
  const existing = document.getElementById("verify-banner");
  if (existing) existing.remove();
}

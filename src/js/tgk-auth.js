/* ===========================================================
   TGK — Auth System (Sign in / Sign up / Verify Banner)
   v4.1 — Production Stable (Hybrid Safe Structure)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);

/* ===========================================================
   🜂 Persistence + Auth State Watcher
   =========================================================== */

await setPersistence(auth, browserLocalPersistence);
console.log("[Auth] Persistence set → browserLocalPersistence");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("[Auth] No user signed in");
    removeVerifyBanner();
    return;
  }

  console.log("[Auth] Auth state:", user.email || "(no email)");

  try {
    await user.reload();
  } catch (err) {
    console.warn("[Auth] Could not reload user:", err.message);
  }

  if (!user.emailVerified) {
    console.log("[Auth] Email not verified:", user.email);
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

(function ensureGate() {
  if (window.__TGK_GATE__ && typeof window.__TGK_GATE__.consumeReturnUrl === "function") {
    consumeReturnUrl = window.__TGK_GATE__.consumeReturnUrl;
  } else {
    setTimeout(ensureGate, 50);
  }
})();

/* ===========================================================
   🜂 Utilities
   =========================================================== */

const normaliseEmail = (e) => (e || "").trim().toLowerCase();

const friendlyErrors = {
  "auth/user-not-found": "No account exists with that email address.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/email-already-in-use": "An account already exists with that email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

function showLoginStatus(code, fallback) {
  const statusEl = document.getElementById("login-status");
  if (!statusEl) return;

  const msg = friendlyErrors[code] || fallback || "Unable to log in.";
  statusEl.textContent = msg;
  statusEl.classList.remove("hidden");
}

/* ===========================================================
   🜂 SIGN IN
   =========================================================== */

window.pageSignin = async (email, password) => {
  console.log("[Auth] Sign in attempt");

  try {
    const cred = await signInWithEmailAndPassword(auth, normaliseEmail(email), password);
    console.log("[Auth] Signed in:", cred.user.email);

    // 1) Sync entitlements through Netlify function
    const token = await cred.user.getIdToken();
    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    console.log("[Auth] Entitlement sync:", data);

    // 2) Force token refresh so claims are live
    await cred.user.getIdToken(true);

    // 3) Cache tier locally for UI
    if (data.tier) {
      localStorage.setItem("tgk-tier", data.tier);
    }

    // 4) Return to gated page if there is one, else dashboard
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Sign in error:", err.code, err.message);

    const ignorable = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
    ];

    if (!ignorable.includes(err.code)) {
      showLoginStatus(err.code, err.message);
    } else {
      console.warn("[Auth] Non critical sign in error suppressed:", err.code);
    }
  }
};

/* ===========================================================
   🜂 SIGN UP
   =========================================================== */

let signupLock = false;

window.pageSignup = async (email, password, confirmEmail) => {
  if (signupLock) return;
  signupLock = true;

  try {
    const e1 = normaliseEmail(email);
    const e2 = normaliseEmail(confirmEmail);

    // 1) Email confirmation check
    const mismatchEl = document.getElementById("email-mismatch");
    if (e1 !== e2) {
      if (mismatchEl) mismatchEl.style.display = "block";
      signupLock = false;
      return;
    }
    if (mismatchEl) mismatchEl.style.display = "none";

    // 2) Password rules
    const rules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (Object.values(rules).includes(false)) {
      alert(
        "Password must include at least 8 characters and contain:\n" +
        "• Uppercase letter\n" +
        "• Lowercase letter\n" +
        "• Number\n" +
        "• Special character"
      );
      signupLock = false;
      return;
    }

    // 3) Create Firebase user
    const { createUserWithEmailAndPassword } =
      await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");

    const cred = await createUserWithEmailAndPassword(auth, e1, password);
    const user = cred.user;
    console.log("[Auth] Created user:", user.uid);

    // 4) Send verification email using Firebase Action Handler
    try {
      await sendEmailVerification(user);
      console.log("[Auth] Verification email sent");
    } catch (err) {
      console.warn("[Auth] Verification email send failed:", err.message);
    }

    // 5) Create or reuse free tier Stripe customer
    const checkoutRes = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: e1,
        priceId: "price_1SSbN52NNS39COWZzEg9tTWn", // Free tier price id
      }),
    });

    const checkoutJson = await checkoutRes.json();
    const customerId = checkoutJson.customerId;
    console.log("[Auth] Stripe free tier linkage:", customerId);

    // 6) Sync entitlements so tier is written and claims are updated
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        customerId,
        email: e1,
      }),
    });

    // 7) Refresh token and cache tier
    await user.getIdToken(true);
    localStorage.setItem("tgk-tier", "initiate");

    alert(
      "Welcome to The Gnostic Key.\n\n" +
      "We have sent a quick verification link to your email. " +
      "You can explore right away, but please confirm your address to secure your access."
    );

    // 8) Return to gated page if present, else dashboard
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Sign up error:", err.code, err.message);

    const ignorable = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-blocked",
      "auth/popup-closed-by-user",
    ];

    if (!ignorable.includes(err.code)) {
      showLoginStatus(err.code, err.message);
    } else {
      console.warn("[Auth] Non critical sign up error suppressed:", err.code);
    }

  } finally {
    signupLock = false;
  }
};

/* ===========================================================
   🜂 PASSWORD RESET
   =========================================================== */

function pageReset(email) {
  const addr = normaliseEmail(email);
  if (!addr.includes("@")) {
    alert("Please enter a valid email address.");
    return;
  }

  sendPasswordResetEmail(auth, addr)
    .then(() => alert("Password reset link sent. Please check your inbox."))
    .catch((e) => alert("Error sending reset link: " + e.message));
}

/* ===========================================================
   🜂 FORM BINDING
   =========================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindForms);
} else {
  bindForms();
}

function bindForms() {
  console.log("[Auth] Binding forms");

  // Sign in form
  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signinForm.querySelector("#signin-email")?.value;
      const pw = signinForm.querySelector("#signin-password")?.value;
      if (email && pw) {
        pageSignin(email, pw);
      }
    });
  }

  // Sign up form
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm.querySelector("#signup-email")?.value;
      const confirm = signupForm.querySelector("#signup-email-confirm")?.value;
      const pw = signupForm.querySelector("#signup-password")?.value;
      if (email && confirm && pw) {
        pageSignup(email, pw, confirm);
      }
    });
  }

  // Password reset trigger
  const resetLink = document.getElementById("reset-link");
  if (resetLink) {
    resetLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = prompt("Enter the email address associated with your account:");
      if (email) pageReset(email);
    });
  }
}

/* ===========================================================
   🜂 EMAIL VERIFICATION BANNER
   =========================================================== */

function showVerifyBanner(user) {
  if (!user) return;
  if (document.getElementById("verify-banner")) return;

  const banner = document.createElement("div");
  banner.id = "verify-banner";
  banner.innerHTML = `
    <span>Your email has not yet been verified.</span>
    <button id="resend-link">Resend verification link</button>
  `;

  document.body.prepend(banner);

  const resendBtn = banner.querySelector("#resend-link");
  if (!resendBtn) return;

  resendBtn.addEventListener("click", async () => {
    try {
      await sendEmailVerification(user);
      banner.innerHTML = `<span>Verification link re-sent to ${user.email}.</span>`;
      console.log("[VerifyBanner] Verification email re-sent");
    } catch (err) {
      console.error("[VerifyBanner] Resend failed:", err);
      banner.innerHTML = `<span>Could not send verification link: ${err.message}</span>`;
    }
  });
}

function removeVerifyBanner() {
  const existing = document.getElementById("verify-banner");
  if (existing) existing.remove();
}

/* ===========================================================
   🜂 Cross tab verification sync (BroadcastChannel + polling)
   =========================================================== */

let verifyChannel = null;
try {
  if ("BroadcastChannel" in window) {
    verifyChannel = new BroadcastChannel("tgk-email-verify");
    verifyChannel.onmessage = async (event) => {
      if (!event || !event.data || !event.data.verified) return;

      console.log("[Auth] Verification message received from another tab");

      try {
        await auth.currentUser?.reload();
        await auth.currentUser?.getIdToken(true);
      } catch (err) {
        console.warn("[Auth] Could not refresh user after verification:", err.message);
      }

      removeVerifyBanner();
      // Hard reload to let gate and UI pick up new claims
      window.location.href = window.location.href;
    };
  }
} catch (err) {
  console.warn("[Auth] BroadcastChannel not available:", err.message);
}

// Fallback polling if BroadcastChannel is not available or not used
setInterval(async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await user.reload();
    if (user.emailVerified) {
      console.log("[Auth] Email verification detected by polling");
      removeVerifyBanner();
      window.location.href = window.location.href;
    }
  } catch (err) {
    console.warn("[Auth] Polling error:", err.message);
  }
}, 4000);

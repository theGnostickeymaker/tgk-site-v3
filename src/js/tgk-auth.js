/* ===========================================================
   TGK — Auth Pages (Sign-in / Sign-up) v3.9
   Clean Verification + Gate Integration + Stable Banner
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

  console.log("[Auth] Auth state:", user.email);

  try {
    await user.reload();
  } catch (err) {
    console.warn("[Auth] Could not reload user:", err.message);
  }

  if (!user.emailVerified) {
    showVerifyBanner(user);
  } else {
    removeVerifyBanner();
  }
});

/* ===========================================================
   🜂 Gate Integration (consumeReturnUrl)
   =========================================================== */

let consumeReturnUrl = () => false;

(function ensureGate() {
  if (window.__TGK_GATE__?.consumeReturnUrl) {
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
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment.",
  "auth/email-already-in-use": "An account already exists with that email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/network-request-failed": "Network error. Please try again."
};

function showLoginStatus(code, fallback) {
  const statusEl = document.getElementById("login-status");
  if (!statusEl) return;

  statusEl.textContent = friendlyErrors[code] || fallback || "Unable to log in.";
  statusEl.classList.remove("hidden");
}

/* ===========================================================
   SIGN IN
   =========================================================== */

window.pageSignin = async (email, password) => {
  console.log("[Auth] Sign-in attempt");
  try {
    const cred = await signInWithEmailAndPassword(auth, normaliseEmail(email), password);
    console.log("[Auth] Signed in:", cred.user.email);

    // Sync entitlements
    const token = await cred.user.getIdToken();
    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    console.log("[Auth] Entitlement sync:", data);

    // Refresh
    await cred.user.getIdToken(true);

    if (data.tier) localStorage.setItem("tgk-tier", data.tier);

    // Navigate
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Sign-in error:", err.code);

    const ignorable = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-closed-by-user",
      "auth/popup-blocked"
    ];

    if (!ignorable.includes(err.code)) {
      showLoginStatus(err.code, err.message);
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
    // Password Rules
    const rules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    if (Object.values(rules).includes(false)) {
      alert("Password must include 8+ chars with upper, lower, number, special.");
      return;
    }

    // Create user
    const { createUserWithEmailAndPassword } = 
      await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");

    const cred = await createUserWithEmailAndPassword(
      auth,
      normaliseEmail(email),
      password
    );

    const user = cred.user;

    // Send verification email (NO OVERRIDE — Firebase routes to /auth/action/)
    try {
      await sendEmailVerification(user);
      console.log("[Auth] Verification email sent");
    } catch (err) {
      console.warn("[Auth] Verification send error:", err.message);
    }

    // Create free tier Stripe customer
    const checkout = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: normaliseEmail(email),
        priceId: "price_1SSbN52NNS39COWZzEg9tTWn"
      })
    });

    const { customerId } = await checkout.json();

    // Update entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        customerId,
        email: normaliseEmail(email)
      })
    });

    await user.getIdToken(true);
    localStorage.setItem("tgk-tier", "initiate");

    alert("Welcome to The Gnostic Key. A verification link has been sent to your email.");

    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Sign-up error:", err.code);

    const ignorable = [
      "auth/network-request-failed",
      "auth/internal-error",
      "auth/popup-closed-by-user",
      "auth/popup-blocked"
    ];

    if (!ignorable.includes(err.code)) {
      showLoginStatus(err.code, err.message);
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
  console.log("[Auth] Binding forms");

  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      pageSignin(
        signinForm.querySelector("#signin-email")?.value,
        signinForm.querySelector("#signin-password")?.value
      );
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      pageSignup(
        signupForm.querySelector("#signup-email")?.value,
        signupForm.querySelector("#signup-password")?.value
      );
    });
  }

  document.getElementById("reset-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter your email:");
    if (email) pageReset(email);
  });
}

/* ===========================================================
   EMAIL VERIFICATION BANNER
   =========================================================== */

function showVerifyBanner(user) {
  if (document.getElementById("verify-banner")) return;

  const banner = document.createElement("div");
  banner.id = "verify-banner";
  banner.innerHTML = `
    <span>Your email has not been verified.</span>
    <button id="resend-link">Resend verification link</button>
  `;

  document.body.prepend(banner);

  banner.querySelector("#resend-link").addEventListener("click", async () => {
    try {
      await sendEmailVerification(user); // No custom URL — allows Firebase Action Handler
      banner.innerHTML = `<span>Verification link sent to ${user.email}.</span>`;
    } catch (err) {
      banner.innerHTML = `<span>Could not send verification link: ${err.message}</span>`;
    }
  });
}

function removeVerifyBanner() {
  document.getElementById("verify-banner")?.remove();
}

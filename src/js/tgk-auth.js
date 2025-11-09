/* ===========================================================
   TGK — Auth Pages (Sign-in / Sign-up) v3.7 — Stable Gate Sync
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);

// Ensure persistence before anything else runs
await setPersistence(auth, browserLocalPersistence);
console.log("[Auth] Persistence set to browserLocalPersistence");

// === Wait for persisted user before any gated checks ===
onAuthStateChanged(auth, (user) => {
  console.log("[Auth] onAuthStateChanged:", user ? user.email : "none");
});

// === ENSURE __TGK_GATE__ ===
let consumeReturnUrl = () => false;
const ensureGate = () => {
  if (window.__TGK_GATE__?.consumeReturnUrl) {
    consumeReturnUrl = window.__TGK_GATE__.consumeReturnUrl;
  } else {
    setTimeout(ensureGate, 50);
  }
};
ensureGate();

// Normalise email input
const normaliseEmail = (e) => (e || "").trim().toLowerCase();

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

    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    console.error("[Auth] Login failed:", err);
    alert("Login failed: " + (err.message || "Unknown error"));
  }
};

/* ===========================================================
   SIGN UP
   =========================================================== */
window.pageSignup = async (email, password) => {
  let lock = false;
  if (lock) return;
  lock = true;

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

    // 3. Start Stripe checkout (or default plan)
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: normaliseEmail(email),
        priceId: "price_free_initiate" // default free tier
      })
    });

    if (!res.ok) throw new Error((await res.json()).error || "Checkout session failed");

    const { customerId } = await res.json();

    // 4. Sync entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, customerId, email: normaliseEmail(email) })
    });

    // 5. Refresh token + local tier
    await user.getIdToken(true);
    localStorage.setItem("tgk-tier", "initiate");

    alert("Welcome to The Gnostic Key!");
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    console.error("[Auth] Signup failed:", err);
    alert("Signup failed: " + err.message);
  } finally {
    lock = false;
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

/* ===========================================================
   TGK — Auth Pages (Sign-in / Sign-up) v3.6 — FINAL (CLAIMS SYNC)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);

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

// Normalize email
const normalizeEmail = (e) => (e || "").trim().toLowerCase();

// === pageSignin ===
window.pageSignin = async (email, password) => {
  console.log("[Auth] pageSignin called");
  try {
    const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    console.log("[Auth] Signed in:", cred.user.email);

    // STEP 1: SEND TOKEN TO SYNC CLAIMS
    const token = await cred.user.getIdToken();
    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    console.log("[Auth] set-entitlements response:", data);

    // STEP 2: FORCE REFRESH TOKEN TO GET NEW CLAIMS
    await cred.user.getIdToken(true);
    console.log("[Auth] Token refreshed — claims now in effect");

    // STEP 3: STORE TIER IN localStorage (fallback)
    if (data.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      console.log("[Auth] localStorage.tgk-tier set to:", data.tier);
    }

    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    console.error("[Auth] Login failed:", err);
    alert("Login failed: " + (err.message || "Unknown error"));
  }
};

// === pageSignup ===
// === pageSignup ===
window.pageSignup = async (email, password) => {
  let lock = false;
  if (lock) return;
  lock = true;

  try {
    // 1. Validate password before doing anything else
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // 2. Create Firebase user first
    const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");
    const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const user = cred.user;

    // 3. Start Stripe checkout (or free tier setup)
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: normalizeEmail(email),
        priceId: "price_free_initiate" // or whichever default plan ID applies
      })
    });

    if (!res.ok) throw new Error((await res.json()).error || "Checkout session failed");

    const { customerId } = await res.json();

    // 4. Sync entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, customerId, email: normalizeEmail(email) })
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

function pageReset(email) {
  const addr = normalizeEmail(email);
  if (!addr.includes("@")) return alert("Invalid email.");
  sendPasswordResetEmail(auth, addr)
    .then(() => alert("Reset link sent."))
    .catch(e => alert("Error: " + e.message));
}

// === DOM READY: Bind forms ===
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindForms);
} else {
  bindForms();
}

function bindForms() {
  console.log("[Auth] Binding forms...");

  const signinForm = document.getElementById("signin-form");
  if (signinForm) {
    signinForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = signinForm.querySelector("#signin-email")?.value;
      const pw = signinForm.querySelector("#signin-password")?.value;
      if (email && pw) {
        console.log("[Auth] Submitting sign-in...");
        pageSignin(email, pw);
      }
    });
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = signupForm.querySelector("#signup-email")?.value;
      const pw = signupForm.querySelector("#signup-password")?.value;
      if (email && pw) {
  const passwordPolicy = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
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

      pageSignup(email, pw);
    } else {
      alert("Please enter both email and password.");
    }


  document.getElementById("reset-link")?.addEventListener("click", e => {
    e.preventDefault();
    const email = prompt("Enter your email:");
    if (email) pageReset(email);
  });
}
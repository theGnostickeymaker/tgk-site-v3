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
window.pageSignup = async (email, password) => {
  try {
    const res = await fetch("/.netlify/functions/signup-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizeEmail(email), password })
    });

    if (!res.ok) throw new Error((await res.json()).error);

    const { uid, customerId } = await res.json();
    const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);

    // Sync entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      body: JSON.stringify({ uid: cred.user.uid, customerId, email: normalizeEmail(email) })
    });

    alert("Welcome!");
    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");
  } catch (err) {
    alert("Signup failed: " + err.message);
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
      if (email && pw && pw.length >= 8) {
        pageSignup(email, pw);
      } else {
        alert("Password must be 8+ characters.");
      }
    });
  }

  document.getElementById("reset-link")?.addEventListener("click", e => {
    e.preventDefault();
    const email = prompt("Enter your email:");
    if (email) pageReset(email);
  });
}
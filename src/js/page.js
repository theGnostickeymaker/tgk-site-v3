/* ===========================================================
   🜂 TGK — PAGE.js (Auth + Stripe)
   Handles signup, signin, logout, and tier sync.
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

/* === 🔑 Live Firebase Config === */
const firebaseConfig = {
  apiKey: "AIzaSyDYrFIw9I3hManf1TqvP6FARZTC-MlMuz0",
  authDomain: "the-gnostic-key.firebaseapp.com",
  projectId: "the-gnostic-key",
  storageBucket: "the-gnostic-key.firebasestorage.app",
  messagingSenderId: "903609435224",
  appId: "1:903609435224:web:3031fc94c9fbbe78f8762d",
  measurementId: "G-KD96SXX3JY"
};
// === 🜂 Init ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// === 🧙 Signup ===
async function pageSignup(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();

    await fetch("/.netlify/functions/create-stripe-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    });

    alert("Welcome to The Gnostic Key ✦ Account created.");
    window.location.href = "/dashboard/";
  } catch (err) {
    console.error("[PAGE] Signup error:", err);
    alert("Signup failed: " + err.message);
  }
}

// === 🔐 Sign In ===
async function pageSignin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/dashboard/";
  } catch (err) {
    console.error("[PAGE] Signin error:", err);
    alert("Login failed: " + err.message);
  }
}

// === 🕊️ Password Reset ===
function pageReset(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent to your email."))
    .catch((e) => alert("Error: " + e.message));
}

// === 🚪 Logout ===
function pageLogout() {
  signOut(auth)
    .then(() => (window.location.href = "/"))
    .catch((e) => console.error("[PAGE] Logout error:", e));
}

// === 🜂 Watch Auth ===
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  if (user) {
    console.info("[PAGE] Logged in:", user.email);
    if (userInfo) userInfo.textContent = `Signed in as ${user.email}`;
    document.body.classList.add("is-auth");
  } else {
    document.body.classList.remove("is-auth");
    if (document.body.classList.contains("requires-auth")) {
      window.location.href = "/signin/";
    }
  }
});

// === 🪶 Auto-bind forms ===
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetBtn = document.getElementById("password-reset");
  const logoutBtn = document.getElementById("logout-btn");

  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector("#signup-email").value.trim();
    const pw = e.target.querySelector("#signup-password").value.trim();
    pageSignup(email, pw);
  });

  signinForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector("#signin-email").value.trim();
    const pw = e.target.querySelector("#signin-password").value.trim();
    pageSignin(email, pw);
  });

  resetBtn?.addEventListener("click", () => {
    const email = prompt("Enter your email to reset password:");
    if (email) pageReset(email);
  });

  logoutBtn?.addEventListener("click", pageLogout);
});

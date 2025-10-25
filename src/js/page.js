/* ===========================================================
   🜂 TGK — PAGE.js (Auth + Stripe + Entitlement Sync)
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
  storageBucket: "the-gnostic-key.appspot.com",
  messagingSenderId: "903609435224",
  appId: "1:903609435224:web:3031fc94c9fbbe78f8762d",
  measurementId: "G-KD96SXX3JY"
};

// === 🜂 Init ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* 🧙 SIGNUP — Create user → Stripe Customer → Firestore Entitlement */
async function pageSignup(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();

    // 🔹 Link Firebase → Stripe → Firestore
    const res = await fetch("/.netlify/functions/create-stripe-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Stripe customer creation failed");

    // 🔹 Generate and set entitlement cookie (tgk_ent)
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: data.customerId, email })
    });

    alert("Welcome to The Gnostic Key ✦ Account created.");
    window.location.href = "/dashboard/";
  } catch (err) {
    console.error("[PAGE] Signup error:", err);
    alert("Signup failed: " + err.message);
  }
}

/* 🔐 SIGNIN — Firebase Auth + Entitlement refresh */
async function pageSignin(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken();

    // Refresh entitlement cookie
    const entRef = await fetch("/.netlify/functions/refresh-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (!entRef.ok) console.warn("[PAGE] Entitlement refresh failed");

    window.location.href = "/dashboard/";
  } catch (err) {
    console.error("[PAGE] Signin error:", err);
    alert("Login failed: " + err.message);
  }
}

/* 🕊️ PASSWORD RESET */
function pageReset(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent to your email."))
    .catch((e) => alert("Error: " + e.message));
}

/* 🚪 LOGOUT */
function pageLogout() {
  signOut(auth)
    .then(() => {
      // Remove session cookie manually (client side only)
      document.cookie = "tgk_ent=; Path=/; Max-Age=0;";
      window.location.href = "/";
    })
    .catch((e) => console.error("[PAGE] Logout error:", e));
}

/* 🜂 WATCH AUTH STATE */
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

/* 🪶 AUTO-BIND FORMS */
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

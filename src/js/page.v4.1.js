/* ===========================================================
   TGK — PAGE.js (Auth + Stripe + Entitlement + Dashboard)
   v4.1 — Basil Atomic Client (2025-11-01)
   Fixes: Double-signup, Firebase race, Safari async, duplicate UIDs
   Requires: create-checkout-session.js (server creates user)
   =========================================================== */
console.log("[TGK] page.v4.1.js LOADED — ONLY ONCE");

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
await setPersistence(auth, browserLocalPersistence);

/* ===========================================================
   GLOBAL STATE — Prevent Double Signup (per email + global)
   =========================================================== */
let signupLock = false;
const pendingEmails = new Set();

/* ===========================================================
   SIGNUP — Atomic: Server creates user + Stripe + Entitlement
   =========================================================== */
async function pageSignup(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Double-lock
  if (signupLock || pendingEmails.has(normalizedEmail)) {
    console.warn(`[TGK] Signup locked for ${normalizedEmail}`);
    return;
  }

  signupLock = true;
  pendingEmails.add(normalizedEmail);

  const feedback = document.getElementById("auth-feedback");
  const submitBtn = document.getElementById("signup-submit");
  const btnText = submitBtn?.querySelector(".btn-text");
  const btnLoading = submitBtn?.querySelector(".btn-loading");

  // SHOW LOADING
  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.hidden = true;
  if (btnLoading) btnLoading.hidden = false;
  if (feedback) {
    feedback.hidden = false;
    feedback.textContent = "Creating your account...";
  }

  try {
    console.log(`[TGK] Atomic signup → server`);

    // SERVER CREATES USER + STRIPE + ENTITLEMENT
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Account setup failed");
    }

    const data = await res.json();
    if (!data.success) throw new Error("Server signup failed");

    console.log(`[TGK] Server created: ${data.uid} → ${data.customerId}`);

    // NOW SIGN IN (user exists)
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = cred.user;

    // REFRESH ENTITLEMENTS (idempotent)
    const entRes = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        customerId: data.customerId,
        email: normalizedEmail
      })
    });

    if (!entRes.ok) {
      const err = await entRes.json();
      console.warn("[TGK] Entitlements refresh failed (non-critical):", err);
    }

    if (feedback) feedback.textContent = "Welcome! Redirecting...";
    alert("Welcome to The Gnostic Key — Account created.");
    window.location.href = "/dashboard/";

  } catch (err) {
    console.error("[TGK] Signup error:", err);
    const msg = err.message.includes("already exists")
      ? "This email is already registered. Please sign in."
      : err.message;

    alert("Signup failed: " + msg);
    if (feedback) {
      feedback.textContent = msg;
      feedback.style.color = "var(--gold-dark)";
    }
  } finally {
    // RESTORE STATE
    signupLock = false;
    pendingEmails.delete(normalizedEmail);
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.hidden = false;
    if (btnLoading) btnLoading.hidden = true;
    if (feedback) setTimeout(() => { feedback.hidden = true; }, 5000);
  }
}

/* ===========================================================
   SIGNIN — Firebase + Entitlement Refresh + Safari Fix
   =========================================================== */
async function pageSignin(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const feedback = document.getElementById("auth-feedback");

  try {
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const user = cred.user;

    await new Promise(res => setTimeout(res, 300));
    const token = await user.getIdToken();

    await fetch("/.netlify/functions/refresh-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    console.log(`[TGK] Logged in: ${user.email}`);
    window.location.href = "/dashboard/";
  } catch (err) {
    console.warn("[TGK] Signin failed:", err.message);
    setTimeout(async () => {
      const current = auth.currentUser;
      if (current) {
        console.log("[TGK] False fail — session recovered");
        window.location.href = "/dashboard/";
      } else {
        const msg = err.code === "auth/user-not-found"
          ? "No account found. Please sign up."
          : err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.message;
        alert("Login failed: " + msg);
        if (feedback) {
          feedback.textContent = msg;
          feedback.hidden = false;
        }
      }
    }, 800);
  }
}

/* ===========================================================
   PASSWORD RESET
   =========================================================== */
function pageReset(email) {
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email.");
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Password reset link sent to your email."))
    .catch(e => alert("Error: " + e.message));
}

/* ===========================================================
   SIGNOUT — Full Flush
   =========================================================== */
async function pageSignout() {
  console.log("[TGK] Signing out…");
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setTimeout(() => window.location.replace("/signin/"), 300);
  } catch (err) {
    console.error("[TGK] Signout error:", err);
    alert("Sign out failed: " + err.message);
  }
}

/* ===========================================================
   DASHBOARD DATA
   =========================================================== */
async function loadDashboardData(user) {
  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  if (!nameEl || !tierEl) return;

  nameEl.textContent = user.email.split("@")[0];
  tierEl.textContent = "Loading…";

  try {
    const snap = await getDoc(doc(db, "entitlements", user.uid));
    const tier = snap.exists() ? (snap.data()?.tier || "free") : "free";
    tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    localStorage.setItem("tgk-tier", tier);
    console.log(`[TGK] Tier: ${tier}`);
  } catch (err) {
    console.error("[TGK] Tier load error:", err);
    tierEl.textContent = "Error";
  }
}

/* ===========================================================
   PROFILE
   =========================================================== */
async function loadUserProfile(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  if (!nameInput || !emailInput) return;

  emailInput.value = user.email;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().displayName) {
      nameInput.value = snap.data().displayName;
    }
  } catch (err) {
    console.warn("[TGK] No profile:", err.message);
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Not signed in.");
  const name = document.getElementById("profile-name").value.trim();
  try {
    await setDoc(doc(db, "users", user.uid), {
      displayName: name,
      email: user.email,
      updated: Date.now()
    }, { merge: true });
    alert("Profile saved.");
  } catch (err) {
    alert("Save failed: " + err.message);
  }
}

/* ===========================================================
   AUTH WATCHER
   =========================================================== */
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  if (user) {
    console.info("[TGK] Logged in:", user.email);
    if (userInfo) userInfo.textContent = `Signed in as ${user.email}`;
    document.body.classList.add("is-auth");

    if (window.location.pathname.includes("/dashboard")) loadDashboardData(user);
    if (window.location.pathname.includes("/account")) loadUserProfile(user);

    document.querySelectorAll('[data-auth="true"]').forEach(el => el.hidden = false);
    document.querySelectorAll('[data-auth="false"]').forEach(el => el.hidden = true);
  } else {
    document.body.classList.remove("is-auth");
    document.querySelectorAll('[data-auth="true"]').forEach(el => el.hidden = true);
    document.querySelectorAll('[data-auth="false"]').forEach(el => el.hidden = false);

    if (document.body.classList.contains("requires-auth")) {
      window.location.href = "/signin/";
    }
  }
});

/* ===========================================================
   FORM BINDINGS
   =========================================================== */
function bindTGKForms() {
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetBtn = document.getElementById("password-reset");
  const profileForm = document.getElementById("profile-form");

  // Signup
  if (signupForm) {
    signupForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = e.target.querySelector("#signup-email")?.value.trim();
      const pw = e.target.querySelector("#signup-password")?.value.trim();
      if (!email || !pw) return alert("Please fill all fields.");
      if (pw.length < 8) return alert("Password must be 8+ characters.");
      pageSignup(email, pw);
    });
  }

  // Signin
  if (signinForm) {
    signinForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = e.target.querySelector("#signin-email")?.value.trim();
      const pw = e.target.querySelector("#signin-password")?.value.trim();
      if (!email || !pw) return alert("Please fill all fields.");
      pageSignin(email, pw);
    });
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const email = prompt("Enter your email:");
      if (email) pageReset(email.trim());
    });
  }

  // Logout
  document.querySelectorAll(".logout-btn").forEach(btn => {
    btn.addEventListener("click", pageSignout);
  });

  // Profile
  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }

  console.log("[TGK] Forms bound");
}

/* ===========================================================
   ONE-TIME BIND
   =========================================================== */
if (!window.__TGK_FORMS_BOUND__) {
  window.__TGK_FORMS_BOUND__ = true;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTGKForms, { once: true });
  } else {
    bindTGKForms();
  }
}

export { app };
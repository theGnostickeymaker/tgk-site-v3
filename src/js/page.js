/* ===========================================================
   🜂 TGK — PAGE.js (Auth + Stripe + Entitlement + Dashboard)
   v2.6 — Stable Auth Lifecycle, Mobile Fixes, UID Alignment
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification
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
   ✦ SIGNUP — Firebase → Stripe → Firestore Entitlement
   =========================================================== */
async function pageSignup(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    const token = await user.getIdToken();

    // 🔹 Create Stripe customer
    const res = await fetch("/.netlify/functions/create-stripe-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    });
    if (!res.ok) throw new Error("Stripe customer creation failed");
    const data = await res.json();

    // 🔹 Write Firestore entitlement keyed by UID
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        customerId: data.customerId,
        email
      })
    });

    // Optional: email verification
    // await sendEmailVerification(user);

    alert("Welcome to The Gnostic Key ✦ Account created.");
    window.location.href = "/dashboard/";
  } catch (err) {
    console.error("[TGK] Signup error:", err);
    alert("Signup failed: " + err.message);
  }
}

/* ===========================================================
   🔐 SIGNIN — Firebase + Cookie Refresh + Safari Fix
   =========================================================== */
async function pageSignin(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Handle Safari race conditions
    await new Promise((res) => setTimeout(res, 300));
    const token = await user.getIdToken();

    await fetch("/.netlify/functions/refresh-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    console.log(`[TGK] ✅ Logged in as ${user.email}`);
    window.location.href = "/dashboard/";
  } catch (err) {
    console.warn("[TGK] Signin warning:", err.message);
    setTimeout(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log("[TGK] ⚠️ False fail detected, continuing session.");
        window.location.href = "/dashboard/";
      } else {
        alert("Login failed: " + err.message);
      }
    }, 800);
  }
}

/* ===========================================================
   🕊️ PASSWORD RESET
   =========================================================== */
function pageReset(email) {
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent to your email."))
    .catch((e) => alert("Error: " + e.message));
}

/* ===========================================================
   🚪 SIGNOUT — Guaranteed Flush + Redirect
   =========================================================== */
async function pageSignout() {
  console.log("[TGK] 🚪 Signing out…");

  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setTimeout(() => {
      window.location.replace("/signin/");
    }, 300);

    console.log("[TGK] ✅ Sign-out complete");
  } catch (err) {
    console.error("[TGK] Sign-out failed:", err);
    alert("Error signing out: " + err.message);
  }
}

/* ===========================================================
   🜂 LOAD DASHBOARD DATA
   =========================================================== */
async function loadDashboardData(user) {
  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  if (!nameEl || !tierEl) return;

  nameEl.textContent = user.email.split("@")[0];
  tierEl.textContent = "Loading…";

  try {
    const docRef = doc(db, "entitlements", user.uid);
    const snap = await getDoc(docRef);

    let tier = "free";
    if (snap.exists()) tier = snap.data()?.tier || "free";

    tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    localStorage.setItem("tgk-tier", tier);
    console.log(`[TGK Dashboard] Tier resolved for ${user.email}: ${tier}`);
  } catch (err) {
    console.error("[TGK Dashboard] Error loading tier:", err);
    tierEl.textContent = "Error";
  }
}

/* ===========================================================
   ✦ PROFILE PREFILL + SAVE
   =========================================================== */
async function loadUserProfile(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  if (!nameInput || !emailInput) return;

  emailInput.value = user.email;
  try {
    const docRef = doc(db, "users", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.displayName) nameInput.value = data.displayName;
    }
  } catch (err) {
    console.warn("[PAGE] No user profile found:", err.message);
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Please sign in first.");
  const name = document.getElementById("profile-name").value.trim();
  try {
    await setDoc(
      doc(db, "users", user.uid),
      { displayName: name, email: user.email, updated: Date.now() },
      { merge: true }
    );
    alert("Profile saved.");
  } catch (err) {
    alert("Error saving profile: " + err.message);
  }
}

/* ===========================================================
   🜂 AUTH WATCHER
   =========================================================== */
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  if (user) {
    console.info("[PAGE] Logged in:", user.email);
    if (userInfo) userInfo.textContent = `Signed in as ${user.email}`;
    document.body.classList.add("is-auth");

    if (window.location.pathname.includes("/dashboard")) loadDashboardData(user);
    if (window.location.pathname.includes("/account")) loadUserProfile(user);

    document.querySelectorAll('[data-auth="true"]').forEach((el) => (el.hidden = false));
    document.querySelectorAll('[data-auth="false"]').forEach((el) => (el.hidden = true));
  } else {
    document.body.classList.remove("is-auth");
    document.querySelectorAll('[data-auth="true"]').forEach((el) => (el.hidden = true));
    document.querySelectorAll('[data-auth="false"]').forEach((el) => (el.hidden = false));

    if (document.body.classList.contains("requires-auth")) {
      window.location.href = "/signin/";
    }
  }
});

/* ===========================================================
   🪶 FORM BINDINGS
   =========================================================== */
function bindTGKForms() {
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const resetBtn = document.getElementById("password-reset");
  const logoutBtn = document.getElementById("logout-btn");
  const profileForm = document.getElementById("profile-form");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.querySelector("#signup-email").value.trim();
      const pw = e.target.querySelector("#signup-password").value.trim();
      pageSignup(email, pw);
    });
  }

  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.querySelector("#signin-email").value.trim();
      const pw = e.target.querySelector("#signin-password").value.trim();
      pageSignin(email, pw);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const email = prompt("Enter your email to reset password:");
      if (email) pageReset(email);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", pageSignout);
  }

  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindTGKForms);
} else {
  bindTGKForms();
}

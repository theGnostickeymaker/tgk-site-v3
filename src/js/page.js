/* ===========================================================
   🜂 TGK — PAGE.js (Auth + Stripe + Entitlement + Dashboard)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);


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

    // 🔹 Generate entitlement record
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

/* 🔐 SIGNIN — Firebase Auth + Entitlement Refresh + Custom Claims Sync */
async function pageSignin(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const token = await user.getIdToken();

    // 🔹 Refresh entitlement cookie (from Firestore/Stripe)
    const entRef = await fetch("/.netlify/functions/refresh-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    if (!entRef.ok) console.warn("[PAGE] Entitlement refresh failed");

    // 🔹 Sync Firebase Custom Claims (tier + role)
    const sync = await fetch("/.netlify/functions/sync-custom-claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        customerId: localStorage.getItem("tgk-customer-id") || null
      })
    });
    if (sync.ok) {
      const data = await sync.json();
      console.log(`[TGK] 🔄 Synced custom claims: ${data.tier}/${data.role}`);
    }

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

/* 🚪 LOGOUT (Safe + Verbose) */
function pageLogout() {
  console.log("[TGK] Logout button clicked.");
  const authInstance = getAuth(app);

  signOut(authInstance)
    .then(() => {
      console.log("[TGK] Firebase signOut success");
      // Clear local storage + cookies
      localStorage.clear();
      document.cookie = "tgk_ent=; Path=/; Max-Age=0;";
      console.log("[TGK] Cleared local data, redirecting home...");
      window.location.href = "/";
    })
    .catch((err) => {
      console.error("[TGK] Logout error:", err);
      alert("Logout failed: " + err.message);
    });
}

/* 🜂 LOAD DASHBOARD TIER (Admin Safe) */
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
    const ADMIN_EMAILS = ["the.keymaker@thegnostickey.com"];
    if (ADMIN_EMAILS.includes(user.email)) {
      tier = "admin";
    } else if (snap.exists()) {
      tier = snap.data()?.tier || "free";
    } else {
      await fetch("/.netlify/functions/set-entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: "none", email: user.email })
      });
    }

    tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    localStorage.setItem("tgk-tier", tier);
    console.log(`[TGK Dashboard] Tier resolved for ${user.email}: ${tier}`);
  } catch (err) {
    console.error("[TGK Dashboard] Error loading tier:", err);
    tierEl.textContent = "Error";
  }
}

/* ✦ PROFILE SAVE + PREFILL */
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

/* 🜂 WATCH AUTH STATE */
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  if (user) {
    console.info("[PAGE] Logged in:", user.email);
    if (userInfo) userInfo.textContent = `Signed in as ${user.email}`;
    document.body.classList.add("is-auth");

    // Populate tier and profile where relevant
    if (window.location.pathname.includes("/dashboard")) loadDashboardData(user);
    if (window.location.pathname.includes("/account")) loadUserProfile(user);

    // Auth-aware navigation
    document.querySelectorAll('[data-auth="true"]').forEach(el => (el.hidden = false));
    document.querySelectorAll('[data-auth="false"]').forEach(el => (el.hidden = true));
  } else {
    document.body.classList.remove("is-auth");
    document.querySelectorAll('[data-auth="true"]').forEach(el => (el.hidden = true));
    document.querySelectorAll('[data-auth="false"]').forEach(el => (el.hidden = false));

    if (document.body.classList.contains("requires-auth")) {
      window.location.href = "/signin/";
    }
  }
});

/* 🪶 AUTO-BIND FORMS (Resilient) */
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
  console.log("[TGK] Logout button detected and bound");
  logoutBtn.addEventListener("click", () => {
    console.log("[TGK] Logout button event fired");
    pageLogout();
  });
}

  if (profileForm) {
    profileForm.addEventListener("submit", saveProfile);
  }
}

// 🜂 Bind immediately if DOM is ready; otherwise, wait
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindTGKForms);
} else {
  bindTGKForms();
}

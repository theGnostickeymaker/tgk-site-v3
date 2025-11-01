/* ===========================================================
   🜂 TGK Account — Profile, Entitlements & Stripe Portal
   v3.7 Basil Standard (2025-11-01)
   =========================================================== */

import { app } from "/js/page.js";
import {
  getAuth,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/* ─────────────────────────────────────────────── */
const auth = getAuth(app);
const db = getFirestore(app);
const statusEl = document.getElementById("profile-status");

/* ===========================================================
   ✦ Toast Helper
   =========================================================== */
function showToast(msg, type = "info") {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    document.body.appendChild(c);
  }
  const t = document.createElement("div");
  t.className = `tgk-toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ===========================================================
   ✦ Tier Reader
   =========================================================== */
function readTier() {
  const m = document.cookie.match(/(?:^|; )tgk_ent=([^;]+)/);
  if (!m) return "free";
  try {
    const [payload] = decodeURIComponent(m[1]).split(".");
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.tier || "free";
  } catch {
    return "free";
  }
}

/* ===========================================================
   ✦ Stripe Portal Redirect
   =========================================================== */
async function openStripePortal() {
  const user = auth.currentUser;
  if (!user) {
    showToast("Please sign in again.", "error");
    return;
  }
  const token = await user.getIdToken();
  const email = user.email;
  const site = window.location.origin;

  try {
    const r = await fetch("/.netlify/functions/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        token,
        returnUrl: `${site}/account/`
      })
    });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else showToast(d.error || "Portal error", "error");
  } catch (err) {
    showToast("⚠️ Stripe error: " + err.message, "error");
  }
}

/* ===========================================================
   ✦ Password Reset
   =========================================================== */
async function triggerPasswordReset() {
  const user = auth.currentUser;
  const email = user?.email || prompt("Enter your account email:");
  if (!email) return;
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("🔐 Password reset link sent to " + email, "success");
  } catch (err) {
    showToast("⚠️ " + err.message, "error");
  }
}

/* ===========================================================
   ✦ Entitlement Refresh (Stripe → TGK Cookie)
   =========================================================== */
async function refreshEntitlements() {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  if (!sessionId) return;
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  try {
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, token })
    });
    history.replaceState({}, "", location.pathname);
    showToast("🔄 Entitlements updated.", "info");
  } catch (err) {
    console.warn("[TGK Account] Entitlement refresh failed:", err);
  }
}

/* ===========================================================
   ✦ Profile Loader
   =========================================================== */
async function loadProfile(user) {
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const tierEl = document.getElementById("tier");

  if (emailEl) emailEl.value = user.email || "";
  if (tierEl) tierEl.textContent = "Your access: " + readTier().toUpperCase();

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists() && nameEl) {
      const display = snap.data().displayName || user.displayName || "";
      nameEl.value = display;
      localStorage.setItem("tgk-display-name", display);
    }
  } catch (err) {
    console.warn("[TGK Account] Profile load error:", err);
  }
}

/* ===========================================================
   ✦ Profile Save (Full Sync)
   =========================================================== */
async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  const name = document.getElementById("profile-name").value.trim();
  if (!name) {
    showToast("Please enter a valid name.", "error");
    return;
  }

  try {
    // 1️⃣ Firestore
    await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
    // 2️⃣ Firebase Auth
    await updateProfile(user, { displayName: name });
    // 3️⃣ Cache
    localStorage.setItem("tgk-display-name", name);
    // 4️⃣ Live reflect on dashboard
    const dashName = document.getElementById("user-name");
    if (dashName) dashName.textContent = name;
    showToast("✅ Profile updated successfully.", "success");
  } catch (err) {
    console.error("[TGK] Save profile error:", err);
    showToast("⚠️ Save failed: " + err.message, "error");
  }
}

/* ===========================================================
   ✦ Auth Lifecycle
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/signin/";
    return;
  }
  await refreshEntitlements();
  await loadProfile(user);
});

/* ===========================================================
   ✦ Bind UI Actions
   =========================================================== */
window.addEventListener("DOMContentLoaded", () => {
  console.log("[TGK Account] Ready");
  document.getElementById("manage")?.addEventListener("click", openStripePortal);
  document.getElementById("password-reset")?.addEventListener("click", triggerPasswordReset);
  document.getElementById("profile-form")?.addEventListener("submit", saveProfile);
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showToast("👋 Signed out successfully.", "info");
      setTimeout(() => (location.href = "/"), 1000);
    } catch (err) {
      showToast("⚠️ Sign out failed: " + err.message, "error");
    }
  });
});

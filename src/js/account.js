/* ===========================================================
   🜂 TGK Account — Profile, Entitlements & Stripe Portal
   v3.5 Stable
   =========================================================== */

import { app } from "/js/page.js";
import {
  getAuth,
  signOut,
  sendPasswordResetEmail,
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
const statusEl = document.getElementById("profile-status");

/* ===========================================================
   ✦ Toast Helper (non-intrusive feedback)
   =========================================================== */
import { showToast } from "/js/toast.js";

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
  const email = user?.email || prompt("Enter your Stripe email:");
  if (!email) return;
  try {
    const r = await fetch("/.netlify/functions/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const d = await r.json();
    if (d.url) location = d.url;
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

  try {
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId })
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
      nameEl.value = snap.data().displayName || user.displayName || "";
    }
  } catch (err) {
    console.warn("[TGK Account] Profile load error:", err);
  }
}

/* ===========================================================
   ✦ Profile Save
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
    await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
    statusEl.textContent = "Saved successfully.";
    showToast("✅ Profile saved.", "success");
    setTimeout(() => (statusEl.textContent = ""), 3000);
  } catch (err) {
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

  const manageBtn = document.getElementById("manage");
  const resetBtn = document.getElementById("password-reset");
  const form = document.getElementById("profile-form");

  if (manageBtn) manageBtn.addEventListener("click", openStripePortal);
  if (resetBtn) resetBtn.addEventListener("click", triggerPasswordReset);
  if (form) form.addEventListener("submit", saveProfile);
});

// ✦ Logout Handler
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("👋 Signed out successfully.", "info");
    setTimeout(() => (location.href = "/"), 1500);
  } catch (err) {
    showToast("⚠️ Sign out failed: " + err.message, "error");
  }
});

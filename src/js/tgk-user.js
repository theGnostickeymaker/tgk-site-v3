/* ===========================================================
   TGK — User UI (Dashboard, Profile, Logout)
   Version 3.0 — Full Membership Integration (2025-11-08)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================================================
   🜂 Load Dashboard / Account Header
   =========================================================== */
export async function loadDashboardHeader(user) {
  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");

  if (!user) return;
  if (!nameEl && !tierEl && !nameInput && !emailInput) return;

  try {
    // Load Firestore documents concurrently
    const [userSnap, entSnap] = await Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDoc(doc(db, "entitlements", user.uid))
    ]);

    // Resolve display name priority
    const displayName =
      user.displayName ||
      (userSnap.exists() && userSnap.data().displayName) ||
      (user.email ? user.email.split("@")[0] : "Seeker");

    // Resolve membership tier
    const tier = entSnap.exists() ? (entSnap.data().tier || "free") : "free";

    // Update dashboard header
    if (nameEl) nameEl.textContent = displayName;
    if (tierEl) tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);

    // Update Account page form fields if present
    if (nameInput) nameInput.value = displayName;
    if (emailInput) emailInput.value = user.email;

    // Cache tier locally
    localStorage.setItem("tgk-tier", tier);

    // Apply visual updates
    updateTierUI(tier);

    console.log(`[TGK] User header loaded → ${displayName} (${tier})`);
  } catch (err) {
    console.error("[User] Header load error:", err);
    if (tierEl) tierEl.textContent = "Error";
  }
}

/* ===========================================================
   🜂 Load User Profile (Account Page)
   =========================================================== */
export async function loadUserProfile(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  if (!nameInput || !emailInput) return;

  emailInput.value = user.email;
  const snap = await getDoc(doc(db, "users", user.uid));
  nameInput.value =
    snap.exists() && snap.data().displayName
      ? snap.data().displayName
      : user.displayName ||
        (user.email ? user.email.split("@")[0] : "Seeker");
}

/* ===========================================================
   🜂 Save Profile (Display Name)
   =========================================================== */
export async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Not signed in.");

  const name = document.getElementById("profile-name").value.trim();
  if (!name) return alert("Name cannot be empty.");

  try {
    // Save displayName to Firestore
    await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });

    // Update Firebase Auth profile too
    if (user.displayName !== name) {
      await updateProfile(user, { displayName: name });
    }

    // Update visible name on dashboard if present
    const dashName = document.getElementById("user-name");
    if (dashName) dashName.textContent = name;

    // Feedback message
    const status = document.getElementById("profile-status");
    if (status) {
      status.textContent = "Saved!";
      status.style.color = "var(--gold)";
      setTimeout(() => (status.textContent = ""), 2000);
    }

    console.log(`[TGK] Display name updated → ${name}`);
  } catch (err) {
    console.error("[User] Save profile error:", err);
    alert("Error saving profile: " + err.message);
  }
}

/* ===========================================================
   🜂 Sign Out
   =========================================================== */
export async function pageSignout() {
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/signin/");
  } catch (err) {
    console.error("[User] Signout error:", err);
    alert("Error signing out: " + err.message);
  }
}

/* ===========================================================
   🜂 Password Reset
   =========================================================== */
export function pageReset(email) {
  if (!email || !email.includes("@")) return alert("Invalid email.");
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset link sent."))
    .catch((e) => alert("Error: " + e.message));
}

/* ===========================================================
   🜂 Tier Badge & Dynamic Button States (extended)
   =========================================================== */
export function updateTierUI(tier) {
  const badge = document.getElementById("tier-badge");
  let tierLabel = "Visitor";

  switch (tier) {
    case "free":
      tierLabel = "Free";
      break;
    case "initiate":
      tierLabel = "Initiate";
      break;
    case "adept":
      tierLabel = "Adept";
      break;
    case "admin":
      tierLabel = "Admin";
      break;
    default:
      tierLabel = "Visitor";
      tier = "visitor";
  }

  // Update badge appearance
  if (badge) {
    badge.className = `tier-badge tier-${tier}`;
    badge.textContent = tierLabel;
  }

  // Update textual tier labels on dashboard/account
  const tierEl = document.getElementById("user-tier");
  if (tierEl) tierEl.textContent = tierLabel;

  // Update membership buttons
  document.querySelectorAll(".checkout-btn").forEach((btn) => {
    const parentTier = btn.closest("[data-tier]")?.dataset?.tier;
    if (!parentTier) return;

    if (tier === "adept" || tier === "admin") {
      btn.textContent = "Unlocked";
      btn.disabled = true;
    } else if (tier === "initiate" && parentTier === "initiate") {
      btn.textContent = "Already a Member";
      btn.disabled = true;
    } else if (tier === "visitor") {
      btn.textContent = "Sign in to Join";
      btn.disabled = false;
    } else {
      btn.disabled = false;
    }
  });

  console.log(`[TGK] Tier UI updated → ${tierLabel}`);
}

// Apply cached tier immediately (on load)
document.addEventListener("DOMContentLoaded", () => {
  const cachedTier = localStorage.getItem("tgk-tier");
  if (cachedTier) updateTierUI(cachedTier);
});

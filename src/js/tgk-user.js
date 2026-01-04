/* ===========================================================
   TGK — User System (Unified Dashboard Edition)
   Version 4.2 — Email Opt-In + Member Since + Live Sync
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
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================================================
   🜂 Load Dashboard Header
   =========================================================== */
export async function loadDashboardHeader(user) {
  if (!user) return;

  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const memberSinceEl = document.getElementById("member-since");
  const emailOptInBox = document.getElementById("profile-email-optin");

  try {
    const [userSnap, entSnap] = await Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDoc(doc(db, "entitlements", user.uid))
    ]);

    const displayName =
      user.displayName ||
      (userSnap.exists() && userSnap.data().displayName) ||
      (user.email ? user.email.split("@")[0] : "Seeker");

    const tokenResult = await user.getIdTokenResult();
    const claimTier = tokenResult.claims?.tier;

    const tier =
      claimTier ||
      (entSnap.exists() && entSnap.data().tier) ||
      "free";

    let memberSince = "";
    if (entSnap.exists() && entSnap.data().created) {
      const created = entSnap.data().created.toDate
        ? entSnap.data().created.toDate()
        : new Date(entSnap.data().created);
      memberSince = created.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
      });
    } else if (user.metadata?.creationTime) {
      const fallbackDate = new Date(user.metadata.creationTime);
      memberSince = fallbackDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric"
      });
    }

    if (nameEl) nameEl.textContent = displayName;
    if (tierEl) tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    if (memberSinceEl && memberSince) {
      memberSinceEl.textContent = `Member since: ${memberSince}`;
    }
    if (nameInput) nameInput.value = displayName;
    if (emailInput) emailInput.value = user.email;

    /* -------------------------------------------
       Load email opt-in preference
       ------------------------------------------- */
    if (emailOptInBox && userSnap.exists()) {
      const data = userSnap.data();
      if (typeof data.emailOptIn === "boolean") {
        emailOptInBox.checked = data.emailOptIn;
      }
    }

    localStorage.setItem("tgk-tier", tier);
    updateTierUI(tier);

    console.log(
      `[TGK] User header loaded → ${displayName} (${tier}) | Since ${memberSince || "N/A"}`
    );
  } catch (err) {
    console.error("[TGK] Header load error:", err);
    if (tierEl) tierEl.textContent = "Error";
  }
}

/* ===========================================================
   🜂 Save Profile (Display Name + Email Opt-In)
   =========================================================== */
export async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Not signed in.");

  const name = document.getElementById("profile-name")?.value.trim();
  if (!name) return alert("Name cannot be empty.");

  const emailOptIn =
    document.getElementById("profile-email-optin")?.checked === true;

  try {
    const updates = {
      displayName: name,
      emailOptIn: emailOptIn,
      updatedAt: serverTimestamp()
    };

    if (emailOptIn === true) {
      updates.emailOptInAt = serverTimestamp();
      updates.emailOptInSource = "dashboard";
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        ...updates
      },
      { merge: true }
    );

    if (user.displayName !== name) {
      await updateProfile(user, { displayName: name });
    }

    const dashName = document.getElementById("user-name");
    if (dashName) dashName.textContent = name;

    const status = document.getElementById("profile-status");
    if (status) {
      status.textContent = "Preferences saved.";
      status.style.color = "var(--gold)";
      status.setAttribute("aria-live", "polite");

      clearTimeout(status._clearTimer);
      status._clearTimer = setTimeout(() => {
        status.textContent = "";
      }, 2500);
    }

    console.log(
      `[TGK] Profile updated → ${name} | Email opt-in: ${emailOptIn}`
    );
  } catch (err) {
    console.error("[TGK] Save profile error:", err);
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
    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log("[TGK] Signed out and cleared session");
    window.location.href = "/";
  } catch (err) {
    console.error("[TGK] Signout error:", err);
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
    .catch(e => alert("Error: " + e.message));
}

/* ===========================================================
   🜂 Tier Badge & Dynamic Button States
   =========================================================== */
export function updateTierUI(tier = "visitor") {
  const badge = document.getElementById("tier-badge");
  const tierEl = document.getElementById("user-tier");

  const labelMap = {
    free: "Free",
    initiate: "Initiate",
    adept: "Adept",
    admin: "Admin",
    visitor: "Visitor"
  };

  const label = labelMap[tier.toLowerCase()] || "Visitor";

  if (badge) {
    badge.className = `tier-badge tier-${tier}`;
    badge.textContent = label;
  }

  if (tierEl) tierEl.textContent = label;

  document.querySelectorAll(".checkout-btn").forEach(btn => {
    const parentTier = btn.closest("[data-tier]")?.dataset?.tier;
    if (!parentTier) return;
    if (tier === "adept" || tier === "admin") {
      btn.textContent = "Unlocked";
      btn.disabled = true;
    } else if (tier === parentTier) {
      btn.textContent = "Already a Member";
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  });

  console.log(`[TGK] Tier UI updated → ${label}`);
}

/* ===========================================================
   🜂 Force Entitlement Sync (every dashboard load)
   =========================================================== */
export async function refreshEntitlementsLive(user) {
  if (!user) return;

  try {
    const token = await user.getIdToken();
    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, uid: user.uid, email: user.email })
    });

    const data = await res.json();
    console.log("[TGK] Live entitlement sync:", data);

    if (res.ok && data.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      await user.getIdToken(true);
      updateTierUI(data.tier);
      return data.tier;
    } else {
      console.warn("[TGK] Unexpected entitlement response:", data);
    }
  } catch (err) {
    console.error("[TGK] Live entitlement sync error:", err);
  }

  return "free";
}

/* ===========================================================
   🜂 Auto-Tier Display on Startup (no flash)
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const cachedTier = localStorage.getItem("tgk-tier") || "visitor";
  updateTierUI(cachedTier);
});

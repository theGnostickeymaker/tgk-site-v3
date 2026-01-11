/* ===========================================================
   TGK — User System (Unified Dashboard Edition)
   Version 4.3 — Phase C: Write-through caching + safe sync
   =========================================================== */

import { app } from "/js/firebase-init.js";
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

import {
  getCached,
  setCached,
  clearAllTgkCache
} from "/js/session-cache.js";

/* ===========================================================
   ✦ Firebase
   =========================================================== */

const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================================================
   ✦ Cache keys
   =========================================================== */

function userCacheKey(uid) {
  return `user:${uid}`;
}

function entitlementCacheKey(uid) {
  return `entitlements:${uid}`;
}

/* ===========================================================
   🜂 Load Dashboard Header (Phase C)
   =========================================================== */

export async function loadDashboardHeader(user) {
  if (!user) return;

  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const memberSinceEl = document.getElementById("member-since");
  const emailOptInBox = document.getElementById("profile-email-optin");

  const cached = getCached(userCacheKey(user.uid));
  if (cached) {
    renderHeaderFromData(cached, {
      nameEl,
      tierEl,
      nameInput,
      emailInput,
      memberSinceEl,
      emailOptInBox
    });
  }

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

    const data = {
      displayName,
      tier,
      memberSince,
      email: user.email,
      emailOptIn:
        userSnap.exists() && typeof userSnap.data().emailOptIn === "boolean"
          ? userSnap.data().emailOptIn
          : null
    };

    renderHeaderFromData(data, {
      nameEl,
      tierEl,
      nameInput,
      emailInput,
      memberSinceEl,
      emailOptInBox
    });

    setCached(userCacheKey(user.uid), data, 300);
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
   ✦ Header renderer (pure)
   =========================================================== */

function renderHeaderFromData(data, els) {
  const {
    nameEl,
    tierEl,
    nameInput,
    emailInput,
    memberSinceEl,
    emailOptInBox
  } = els;

  if (nameEl) nameEl.textContent = data.displayName;
  if (tierEl)
    tierEl.textContent =
      data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  if (nameInput) nameInput.value = data.displayName;
  if (emailInput) emailInput.value = data.email;
  if (memberSinceEl && data.memberSince) {
    memberSinceEl.textContent = `Member since: ${data.memberSince}`;
  }
  if (emailOptInBox && typeof data.emailOptIn === "boolean") {
    emailOptInBox.checked = data.emailOptIn;
  }
}

/* ===========================================================
   🜂 Save Profile (write-through)
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
      emailOptIn,
      updatedAt: serverTimestamp()
    };

    if (emailOptIn === true) {
      updates.emailOptInAt = serverTimestamp();
      updates.emailOptInSource = "dashboard";
    }

    await setDoc(
      doc(db, "users", user.uid),
      { email: user.email, ...updates },
      { merge: true }
    );

    if (user.displayName !== name) {
      await updateProfile(user, { displayName: name });
    }

    setCached(userCacheKey(user.uid), {
      displayName: name,
      tier: localStorage.getItem("tgk-tier") || "free",
      email: user.email,
      emailOptIn
    }, 300);

    console.log(`[TGK] Profile updated → ${name}`);
  } catch (err) {
    console.error("[TGK] Save profile error:", err);
    alert("Error saving profile: " + err.message);
  }
}

/* ===========================================================
   🜂 Sign Out (full cache clear)
   =========================================================== */

export async function pageSignout() {
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    clearAllTgkCache();

    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log("[TGK] Signed out and cleared all cache");
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
   🜂 Tier UI
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

  console.log(`[TGK] Tier UI updated → ${label}`);
}

/* ===========================================================
   🜂 Live Entitlement Sync (safe)
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

    const text = await res.text();
    let data = null;

    try {
      data = JSON.parse(text);
    } catch {
      console.warn("[TGK] Entitlement sync returned non-JSON");
      return;
    }

    if (res.ok && data?.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      setCached(entitlementCacheKey(user.uid), data, 300);
      await user.getIdToken(true);
      updateTierUI(data.tier);
      return data.tier;
    }
  } catch (err) {
    console.error("[TGK] Live entitlement sync error:", err);
  }
}

/* ===========================================================
   🜂 Startup tier (no flash)
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cachedTier = localStorage.getItem("tgk-tier") || "visitor";
  updateTierUI(cachedTier);
});

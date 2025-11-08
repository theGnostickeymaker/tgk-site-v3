/* ===========================================================
   TGK — Account Page Logic
   Stripe Return + Entitlement Sync + Profile Utilities
   =========================================================== */

import { app } from "./firebase-init.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { loadDashboardHeader, saveProfile, pageSignout, pageReset } from "./tgk-user.js";

const auth = getAuth(app);
const db = getFirestore(app);

/* ===========================================================
   🜂 Init
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profile-form");
  const resetBtn = document.getElementById("password-reset");
  const logoutBtn = document.getElementById("logout-btn");
  const manageBtn = document.getElementById("manage");

  if (profileForm) profileForm.addEventListener("submit", saveProfile);
  if (resetBtn) resetBtn.addEventListener("click", () => pageReset(auth.currentUser.email));
  if (logoutBtn) logoutbtn.addEventListener("click", () => window.location.href = "/logout/");
  if (manageBtn) manageBtn.addEventListener("click", openStripePortal);
});

/* ===========================================================
   🜂 Listen for Auth State
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.__TGK_GATE__?.saveReturnUrl?.();
    window.location.replace("/signin/");
    return;
  }

  await loadDashboardHeader(user);

  // If returning from Stripe checkout success
  const url = new URL(window.location.href);
  if (url.searchParams.get("session") === "success") {
    await refreshEntitlement(user);
  }
});

/* ===========================================================
   🜂 Refresh Entitlement (after Stripe)
   =========================================================== */
async function refreshEntitlement(user) {
  const tierEl = document.getElementById("tier") || document.getElementById("user-tier");
  if (tierEl) tierEl.textContent = "Syncing…";

  try {
    const token = await user.getIdToken();
    const body = {
      token,
      uid: user.uid,
      email: user.email,
    };

    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[TGK] Entitlement refresh result:", data);

    if (res.ok && data.tier) {
      // 1) persist locally
      localStorage.setItem("tgk-tier", data.tier);
      // 2) force-refresh claims
      await user.getIdToken(true);
      // 3) update visible UI (badge + text)
      const tierText = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
      if (tierEl) tierEl.textContent = tierText;
      // optional: also nudge the global badge
      import("./tgk-user.js").then((m) => m.updateTierUI?.(data.tier));
      alert(`Your membership has been updated to ${tierText}.`);
    } else {
      console.warn("[TGK] Unexpected entitlement response:", data);
      if (tierEl) tierEl.textContent = "Free";
    }
  } catch (err) {
    console.error("[TGK] Entitlement refresh error:", err);
    if (tierEl) tierEl.textContent = "Error";
  }
}

/* ===========================================================
   🜂 Open Stripe Billing Portal
   =========================================================== */
async function openStripePortal() {
  const user = auth.currentUser;
  if (!user) return alert("You must be signed in to manage billing.");

  try {
    const token = await user.getIdToken();
    const res = await fetch("/.netlify/functions/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email: user.email }),
    });

    const data = await res.json();
    if (res.ok && data.url) {
      console.log("[TGK] Redirecting to Stripe Portal");
      window.location.href = data.url;
    } else {
      console.warn("[TGK] Portal error:", data);
      alert("Could not open billing portal. Please try again.");
    }
  } catch (err) {
    console.error("[TGK] Portal session error:", err);
    alert("Error opening billing portal.");
  }
}

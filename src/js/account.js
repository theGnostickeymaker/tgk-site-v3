/* ===========================================================
   TGK — account.js (v4.5 — FINAL: No 403, Claims + Profile)
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

console.log("[TGK Account] Ready");

/* ===========================================================
   Safe Claims Refresh — NO getIdToken(true)
   Uses getIdTokenResult() → forces fresh token + claims
   =========================================================== */
async function forceClaimsRefresh() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await user.getIdTokenResult(); // ← FORCES NEW TOKEN + CLAIMS
    console.log("[TGK Account] Claims refreshed via getIdTokenResult()");
  } catch (err) {
    console.warn("[TGK Account] Claims refresh failed:", err.message);
  }
}

/* ===========================================================
   Load Tier from Firebase Claims
   =========================================================== */
async function loadTierFromClaims() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const idTokenResult = await user.getIdTokenResult();
    const tier = idTokenResult.claims.tier || "free";
    const role = idTokenResult.claims.role || "user";

    const tierEl = document.getElementById("tier");
    if (tierEl) {
      tierEl.textContent = `Your access: ${tier.toUpperCase()} (${role})`;
      tierEl.style.color = tier === "admin" ? "var(--gold)" : "inherit";
    }

    console.log(`[TGK Account] Tier from claims: ${tier} (${role})`);
  } catch (err) {
    console.error("[TGK Account] Claims load error:", err);
    document.getElementById("tier").textContent = "Error";
  }
}

/* ===========================================================
   Load Profile — RESTORED
   =========================================================== */
async function loadProfile(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");

  if (emailInput) emailInput.value = user.email || "";

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().displayName) {
      nameInput.value = snap.data().displayName;
    }
  } catch (err) {
    console.warn("[TGK Account] No profile:", err.message);
  }
}

/* ===========================================================
   Save Profile
   =========================================================== */
async function saveProfile(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("profile-name").value.trim();
  const status = document.getElementById("profile-status");

  try {
    await setDoc(doc(db, "users", user.uid), {
      displayName: name,
      email: user.email,
      updated: Date.now()
    }, { merge: true });

    status.textContent = "Saved!";
    status.style.color = "var(--gold)";
    setTimeout(() => { status.textContent = ""; }, 3000);
  } catch (err) {
    status.textContent = "Save failed";
    status.style.color = "var(--red)";
  }
}

/* ===========================================================
   Manage Subscription
   =========================================================== */
function setupManageButton() {
  const btn = document.getElementById("manage");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("Not signed in");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/.netlify/functions/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Could not open portal");
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

/* ===========================================================
   Password Reset
   =========================================================== */
function setupPasswordReset() {
  const btn = document.getElementById("password-reset");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user?.email) return alert("No email");

    if (confirm(`Send reset to ${user.email}?`)) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => alert("Reset email sent!"))
        .catch(err => alert("Error: " + err.message));
    }
  });
}

/* ===========================================================
   Logout
   =========================================================== */
function setupLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (confirm("Sign out?")) {
      signOut(auth).then(() => {
        window.location.href = "/signin/";
      });
    }
  });
}

/* ===========================================================
   Auth Watcher — FINAL
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await forceClaimsRefresh();     // ← NO 403
    await loadTierFromClaims();     // ← Shows initiate
    await loadProfile(user);        // ← RESTORED
    setupManageButton();
    setupPasswordReset();
    setupLogout();
  } else {
    window.location.href = "/signin/";
  }
});
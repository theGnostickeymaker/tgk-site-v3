/* ===========================================================
   TGK — Auth System v8.0
   Sign-In, Sign-Up, Verify Banner, Claim Sync, Resume Support
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);

/* ===========================================================
   PERSISTENCE + LISTENER
   =========================================================== */

await setPersistence(auth, browserLocalPersistence);
console.log("[Auth] Persistence set to localStorage");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    removeVerifyBanner();
    return;
  }

  try {
    await user.reload();
  } catch (err) {
    console.warn("[Auth] Could not reload:", err.message);
  }

  if (!user.emailVerified) {
    showVerifyBanner(user);
  } else {
    removeVerifyBanner();
  }
});

/* ===========================================================
   RETURN URL GATE LINK
   =========================================================== */

let consumeReturnUrl = () => false;

(function waitForGate() {
  if (window.__TGK_GATE__?.consumeReturnUrl) {
    consumeReturnUrl = window.__TGK_GATE__.consumeReturnUrl;
  } else {
    setTimeout(waitForGate, 50);
  }
})();

/* ===========================================================
   UTILITIES
   =========================================================== */

const normalise = (e) => (e || "").trim().toLowerCase();

const friendly = {
  "auth/user-not-found": "No account exists with that email address.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/too-many-requests": "Too many attempts. Please wait.",
  "auth/email-already-in-use": "That email is already associated with an account.",
};

function showError(code, fallback) {
  const el = document.getElementById("login-status");
  if (!el) return;
  el.textContent = friendly[code] || fallback || "Unable to sign in.";
  el.classList.remove("hidden");
}

/* ===========================================================
   SIGN IN
   =========================================================== */

window.pageSignin = async (email, password) => {
  console.log("[Auth] Sign-in…");

  try {
    const cred = await signInWithEmailAndPassword(auth, normalise(email), password);

    // Force fresh claims via set-entitlements
    const token = await cred.user.getIdToken(true);

    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    await cred.user.getIdToken(true);

    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Sign-in failed:", err.code);
    showError(err.code, err.message);
  }
};

/* ===========================================================
   SIGN UP
   =========================================================== */

let signupLock = false;

window.pageSignup = async (email, password, confirm) => {
  if (signupLock) return;
  signupLock = true;

  try {
    const e1 = normalise(email), e2 = normalise(confirm);

    if (e1 !== e2) {
      document.getElementById("email-mismatch").style.display = "block";
      signupLock = false;
      return;
    }

    document.getElementById("email-mismatch").style.display = "none";

    // Simple password rules
    const OK =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!OK) {
      alert("Password must include: upper, lower, number, special, and be 8+ characters.");
      signupLock = false;
      return;
    }

    // Create Firebase user
    const { createUserWithEmailAndPassword } =
      await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");

    const cred = await createUserWithEmailAndPassword(auth, e1, password);

    // Send verification link
    await sendEmailVerification(cred.user);

    // Create Stripe free-tier customer
    const checkout = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: cred.user.uid,
        email: e1,
        priceId: "price_1SSbN52NNS39COWZzEg9tTWn",
      }),
    });

    const { customerId } = await checkout.json();

    // Sync entitlements
    await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: cred.user.uid,
        email: e1,
        customerId,
      }),
    });

    alert("Welcome to The Gnostic Key. A verification email has been sent to you.");

    if (consumeReturnUrl()) return;
    window.location.replace("/dashboard/");

  } catch (err) {
    console.error("[Auth] Signup failed:", err.code);
    showError(err.code, err.message);
  }

  signupLock = false;
};

/* ===========================================================
   PASSWORD RESET
   =========================================================== */
window.pageReset = (email) => {
  const e = normalise(email);
  if (!e.includes("@")) return alert("Invalid email.");
  sendPasswordResetEmail(auth, e).then(() => alert("Reset link sent."));
};

/* ===========================================================
   FORM BINDING
   =========================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindForms);
} else {
  bindForms();
}

function bindForms() {
  console.log("[Auth] Binding forms…");

  const sIn = document.getElementById("signin-form");
  if (sIn) {
    sIn.addEventListener("submit", (e) => {
      e.preventDefault();
      pageSignin(
        sIn.querySelector("#signin-email").value,
        sIn.querySelector("#signin-password").value
      );
    });
  }

  const sUp = document.getElementById("signup-form");
  if (sUp) {
    sUp.addEventListener("submit", (e) => {
      e.preventDefault();
      pageSignup(
        sUp.querySelector("#signup-email").value,
        sUp.querySelector("#signup-password").value,
        sUp.querySelector("#signup-email-confirm").value
      );
    });
  }
}

/* ===========================================================
   VERIFY BANNER
   =========================================================== */

function showVerifyBanner(user) {
  if (document.getElementById("verify-banner")) return;

  const b = document.createElement("div");
  b.id = "verify-banner";
  b.innerHTML = `
    <span>Your email has not yet been verified.</span>
    <button id="resend-link">Resend verification link</button>
  `;

  document.body.prepend(b);

  b.querySelector("#resend-link").addEventListener("click", async () => {
    try {
      await sendEmailVerification(user);
      b.innerHTML = `<span>Verification link sent to ${user.email}</span>`;
    } catch (err) {
      b.innerHTML = `<span>Could not send link: ${err.message}</span>`;
    }
  });
}

function removeVerifyBanner() {
  document.getElementById("verify-banner")?.remove();
}

/* ===========================================================
   CROSS-TAB VERIFICATION LISTENER
   =========================================================== */

const verifyChannel = new BroadcastChannel("tgk-email-verify");

verifyChannel.onmessage = async (msg) => {
  if (msg.data?.verified) {
    console.log("[Auth] Verification noticed across tabs");
    await auth.currentUser?.reload();
    await auth.currentUser?.getIdToken(true);
    removeVerifyBanner();
    window.location.reload();
  }
};

/* ===========================================================
   POLLING FAILSAFE
   =========================================================== */

setInterval(async () => {
  const u = auth.currentUser;
  if (!u) return;

  await u.reload();
  if (u.emailVerified) {
    removeVerifyBanner();
    window.location.reload();
  }
}, 5000);

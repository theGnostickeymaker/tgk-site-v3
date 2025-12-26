/* ===========================================================
   TGK - Auth System v8.2
   Sign-in, Sign-up, Verify banner, Claim sync, Return support
   + Email opt-in capture (no sending)
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

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const RETURN_KEY = "tgk-return-url";

function getReturnUrl() {
  const url =
    sessionStorage.getItem(RETURN_KEY) ||
    localStorage.getItem(RETURN_KEY) ||
    "";
  return url || "";
}

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
  console.log("[Auth] Sign-in...");

  try {
    const cred = await signInWithEmailAndPassword(auth, normalise(email), password);

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

window.pageSignup = async (email, password, confirm, emailOptIn) => {
  if (signupLock) return;
  signupLock = true;

  try {
    const e1 = normalise(email);
    const e2 = normalise(confirm);

    if (e1 !== e2) {
      document.getElementById("email-mismatch").style.display = "block";
      signupLock = false;
      return;
    }

    document.getElementById("email-mismatch").style.display = "none";

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

    const { createUserWithEmailAndPassword } =
      await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js");

    const cred = await createUserWithEmailAndPassword(auth, e1, password);

    /* -------------------------------------------
       Create user profile with explicit consent
       ------------------------------------------- */
    const userRef = doc(db, "users", cred.user.uid);

    const userPayload = {
      email: e1,
      tier: "free",
      verified: false,
      emailOptIn: emailOptIn === true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (emailOptIn === true) {
      userPayload.emailOptInAt = serverTimestamp();
      userPayload.emailOptInSource = "signup-form";
    }

    await setDoc(userRef, userPayload, { merge: true });

    /* -------------------------------------------
       Verification email
       ------------------------------------------- */
    const returnUrl = getReturnUrl();
    await sendEmailVerification(cred.user, {
      url: returnUrl || `${location.origin}/dashboard/`,
      handleCodeInApp: false
    });

    /* -------------------------------------------
       Stripe free-tier customer
       ------------------------------------------- */
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
  console.log("[Auth] Binding forms...");

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

      const optIn =
        sUp.querySelector("#signup-email-optin")?.checked === true;

      pageSignup(
        sUp.querySelector("#signup-email").value,
        sUp.querySelector("#signup-password").value,
        sUp.querySelector("#signup-email-confirm").value,
        optIn
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
    <button id="resend-link" type="button">Resend verification link</button>
  `;

  document.body.prepend(b);

  b.querySelector("#resend-link").addEventListener("click", async () => {
    try {
      const returnUrl = getReturnUrl();
      await sendEmailVerification(user, {
        url: returnUrl || window.location.href,
        handleCodeInApp: false
      });
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
   POLLING FAILSAFE
   =========================================================== */

setInterval(async () => {
  const u = auth.currentUser;
  if (!u) return;

  await u.reload();
  if (u.emailVerified) {
    removeVerifyBanner();
  }
}, 5000);

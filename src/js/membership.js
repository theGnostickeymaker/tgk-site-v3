/* ===========================================================
   TGK — Membership Upgrade Flow (Stripe + Firebase)
   - Wires buttons with [data-price] to Stripe Checkout
   - Claims entitlements on return via session_id
   =========================================================== */

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth();
let stripe = null;

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function qp(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function log(...args) {
  console.log("[TGK][Membership]", ...args);
}

function warn(...args) {
  console.warn("[TGK][Membership]", ...args);
}

function err(...args) {
  console.error("[TGK][Membership]", ...args);
}

// -----------------------------------------------------------
// Post-checkout: claim entitlements immediately
// -----------------------------------------------------------
async function claimCheckoutReturn(user) {
  const session = qp("session");
  const sessionId = qp("session_id");

  if (session !== "success" || !sessionId) return;

  log("Checkout return detected. session_id =", sessionId);

  try {
    const token = await user.getIdToken();

    const res = await fetch("/.netlify/functions/set-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        uid: user.uid,
        email: user.email,
        session_id: sessionId
      })
    });

    const data = await res.json().catch(() => ({}));
    log("Post-checkout entitlement sync response:", data);

    if (!res.ok) {
      warn("Entitlement sync failed:", data);
      return;
    }

    // Force refresh so custom claims land client-side
    await user.getIdToken(true);

    if (data?.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      log("Tier cached:", data.tier);
    }

    // Remove querystring so it does not re-run on refresh
    window.history.replaceState({}, "", "/membership/");

    // Optional: send them onward after unlock
    window.location.replace("/dashboard/");
  } catch (e) {
    err("Post-checkout sync error:", e);
  }
}

// -----------------------------------------------------------
// Stripe + button wiring
// -----------------------------------------------------------
function initStripe() {
  const publishableKey = window.STRIPE_PUBLISHABLE_KEY;

  log("window.STRIPE_PUBLISHABLE_KEY =", publishableKey);

  if (!publishableKey) {
    err(
      "Missing window.STRIPE_PUBLISHABLE_KEY. " +
      "Fix: set window.STRIPE_PUBLISHABLE_KEY in base.njk."
    );
    return null;
  }

  if (typeof window.Stripe !== "function") {
    err(
      "Stripe.js not loaded. " +
      "Fix: ensure <script src='https://js.stripe.com/v3'></script> is in base.njk."
    );
    return null;
  }

  const s = window.Stripe(publishableKey);
  log("Stripe initialised");
  return s;
}

function wireButtons() {
  const buttons = Array.from(document.querySelectorAll("[data-price]"));
  log(`Found ${buttons.length} buttons with [data-price]`);

  buttons.forEach((btn) => {
    // Avoid double-binding if this script runs twice for any reason
    if (btn.dataset.tgkBound === "1") return;
    btn.dataset.tgkBound = "1";

    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const priceId = btn.dataset.price;
      if (!priceId) return;

      await startCheckout(priceId, btn);
    });
  });
}

// -----------------------------------------------------------
// Start Stripe Checkout
// -----------------------------------------------------------
async function startCheckout(priceId, buttonEl) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in to upgrade your membership.");
    window.__TGK_GATE__?.saveReturnUrl?.();
    window.location.href = "/signin/";
    return;
  }

  if (!stripe) {
    stripe = initStripe();
    if (!stripe) {
      alert("Stripe could not be initialised. Please refresh and try again.");
      return;
    }
  }

  // Light UX lock
  const originalText = buttonEl?.textContent;
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.textContent = "Redirecting…";
  }

  try {
    const token = await user.getIdToken();

    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        priceId,
        uid: user.uid,
        email: user.email
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.sessionId) {
      err("Checkout session creation failed:", data);
      alert("Sorry, we could not start your checkout session.");
      return;
    }

    log("Redirecting to Stripe Checkout. sessionId =", data.sessionId);
    const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });

    // redirectToCheckout only returns if something blocked it
    if (result?.error?.message) {
      err("Stripe redirect error:", result.error.message);
      alert(result.error.message);
    }
  } catch (e) {
    err("Checkout flow failed:", e);
    alert("An unexpected error occurred. Please try again later.");
  } finally {
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.textContent = originalText || "Continue";
    }
  }
}

// -----------------------------------------------------------
// Boot safely regardless of load timing
// -----------------------------------------------------------
function boot() {
  // Initialise Stripe once
  stripe = initStripe();

  // Wire buttons (even if Stripe failed, handlers still attach and will warn)
  wireButtons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// Observe auth state and claim checkout return
onAuthStateChanged(auth, (user) => {
  if (user) claimCheckoutReturn(user);
});

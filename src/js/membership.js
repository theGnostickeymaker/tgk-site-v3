/* ===========================================================
   TGK — Membership Upgrade Flow (Stripe + Firebase)
   - Wires buttons with [data-price] to Stripe Checkout
   - Claims entitlements on return via session_id
   - Robust against Firebase init order
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
let stripe = null;

function qp(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function log(...args) {
  console.log("[TGK][Membership]", ...args);
}
function warn(...args) {
  console.warn("[TGK][Membership]", ...args);
}
function error(...args) {
  console.error("[TGK][Membership]", ...args);
}

function ensureStripe() {
  const publishableKey = (window.STRIPE_PUBLISHABLE_KEY || "").trim();

  if (!publishableKey) {
    error("Missing window.STRIPE_PUBLISHABLE_KEY. Check base.njk injection and Netlify env.");
    return null;
  }

  if (typeof window.Stripe !== "function") {
    error("Stripe.js not loaded. Ensure https://js.stripe.com/v3 is included in base.njk.");
    return null;
  }

  if (!stripe) {
    stripe = window.Stripe(publishableKey);
    log("Stripe initialised");
  }

  return stripe;
}

function wireButtons() {
  const buttons = Array.from(document.querySelectorAll("[data-price]"));
  log(`Buttons found with [data-price]: ${buttons.length}`);

  buttons.forEach((btn) => {
    if (btn.dataset.tgkBound === "1") return;
    btn.dataset.tgkBound = "1";

    btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const priceId = (btn.dataset.price || "").trim();
      if (!priceId) return;

      await startCheckout(priceId, btn);
    });
  });
}

async function startCheckout(priceId, buttonEl) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in to upgrade your membership.");
    window.__TGK_GATE__?.saveReturnUrl?.();
    window.location.href = "/signin/";
    return;
  }

  const s = ensureStripe();
  if (!s) {
    alert("Stripe is not ready. Please refresh and try again.");
    return;
  }

  const originalText = buttonEl?.textContent;

  try {
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = "Redirecting…";
    }

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
      error("Checkout session creation failed:", data);
      alert("Sorry, we could not start checkout. Please try again.");
      return;
    }

    log("Redirecting to Stripe Checkout:", data.sessionId);

    const result = await s.redirectToCheckout({ sessionId: data.sessionId });

    if (result?.error?.message) {
      error("Stripe redirect error:", result.error.message);
      alert(result.error.message);
    }
  } catch (e) {
    error("Checkout flow failed:", e);
    alert("An unexpected error occurred. Please try again later.");
  } finally {
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.textContent = originalText || "Continue";
    }
  }
}

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
    log("Entitlement sync response:", data);

    if (!res.ok) {
      warn("Entitlement sync failed:", data);
      return;
    }

    await user.getIdToken(true);

    if (data?.tier) {
      localStorage.setItem("tgk-tier", data.tier);
      log("Tier cached:", data.tier);
    }

    window.history.replaceState({}, "", "/membership/");
    window.location.replace("/dashboard/");
  } catch (e) {
    error("Post-checkout entitlement sync error:", e);
  }
}

function boot() {
  log("Booting membership checkout wiring");
  wireButtons();
  ensureStripe(); // optional early init for logging
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

onAuthStateChanged(auth, (user) => {
  if (user) claimCheckoutReturn(user);
});

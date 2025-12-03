/* ===========================================================
   TGK — Membership Upgrade Flow (Stripe + Firebase)
   Clean Stripe v3 init using global Stripe()
   =========================================================== */

import { app } from "./firebase-init.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
let stripe = null;

// Initialise Stripe once DOM + Stripe.js are ready
document.addEventListener("DOMContentLoaded", () => {
  const publishableKey = window.STRIPE_PUBLISHABLE_KEY;

  console.log("DEBUG window.STRIPE_PUBLISHABLE_KEY:", publishableKey);

  if (!publishableKey) {
    console.error("[TGK] Stripe publishable key missing. Check env + base.njk.");
    return;
  }

  if (typeof window.Stripe !== "function") {
    console.error("[TGK] Stripe.js not loaded. Check <script src='https://js.stripe.com/v3'>.");
    return;
  }

  stripe = window.Stripe(publishableKey);
  console.log("[TGK] Stripe initialised");

  // Attach click handlers
  document.querySelectorAll("[data-price]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const priceId = btn.dataset.price;
      startCheckout(priceId);
    });
  });
});

// ===========================================================
//  Start Checkout Flow
// ===========================================================
async function startCheckout(priceId) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in to upgrade your membership.");
    window.__TGK_GATE__?.saveReturnUrl?.();
    window.location.href = "/signin/";
    return;
  }

  await user.reload();
  if (!user.emailVerified) {
    const proceed = confirm(
      "Your email has not been verified yet.\n\n" +
        "You can continue, but please confirm your address to avoid membership access issues.\n\n" +
        "Continue anyway?"
    );
    if (!proceed) return;
  }

  try {
    const token = await user.getIdToken();

    const body = {
      priceId,
      uid: user.uid,
      email: user.email,
      returnUrl: window.location.origin + "/account/"
    };

    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok || !data.sessionId) {
      console.error("[TGK] Checkout error:", data);
      alert("Sorry, we could not start your checkout session.");
      return;
    }

    console.log("[TGK] Redirecting to Stripe session", data.sessionId);
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (err) {
    console.error("[TGK] Checkout flow failed:", err);
    alert("An unexpected error occurred. Please try again later.");
  }
}

// ===========================================================
//  Auth State Awareness (optional UX enhancement)
// ===========================================================
onAuthStateChanged(auth, (user) => {
  document
    .querySelectorAll("[data-auth='false']")
    .forEach((el) => (el.hidden = !!user));
  document
    .querySelectorAll("[data-auth='true']")
    .forEach((el) => (el.hidden = !user));
});

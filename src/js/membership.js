/* ===========================================================
   TGK — Membership Upgrade Flow (Stripe + Firebase)
   CDN Version — Correct Stripe Loader
   =========================================================== */

import { app } from "./firebase-init.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const auth = getAuth(app);
let stripe;

// ===========================================================
// Stripe initialisation (CDN global)
// ===========================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const publishableKey = window.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error("Stripe publishable key missing");

    stripe = Stripe(publishableKey);   // IMPORTANT: Stripe() not loadStripe()

    console.log("[TGK] Stripe ready");
  } catch (err) {
    console.error("[TGK] Stripe init error:", err);
  }
});

// ===========================================================
//  Attach upgrade buttons
// ===========================================================
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-price]");
  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      const priceId = btn.dataset.price;
      await startCheckout(priceId);
    })
  );
});

// ===========================================================
//  MAIN CHECKOUT FUNCTION — **correctly closed**
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
      "Your email has not been verified yet.\n\nYou can continue, but please confirm your address to avoid membership access issues.\n\nContinue anyway?"
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

    console.log(`[TGK] Redirecting to Stripe session ${data.sessionId}`);
    await stripe.redirectToCheckout({ sessionId: data.sessionId });

  } catch (err) {
    console.error("[TGK] Checkout flow failed:", err);
    alert("An unexpected error occurred. Please try again later.");
  }
}

// ===========================================================
//  Auth-based UI updates
// ===========================================================
onAuthStateChanged(auth, (user) => {
  document
    .querySelectorAll("[data-auth='false']")
    .forEach((el) => (el.hidden = !!user));

  document
    .querySelectorAll("[data-auth='true']")
    .forEach((el) => (el.hidden = !user));
});

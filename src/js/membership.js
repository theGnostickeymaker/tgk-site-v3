/* ===========================================================
   TGK — Membership Upgrade Flow v1.3 — FINAL
   Uses global firebaseAuth from firebase-init.js
   =========================================================== */

const auth = window.firebaseAuth;
if (!auth) {
  console.error("[Membership] Firebase Auth not loaded. Is firebase-init.js included?");
}

const tierRank = { free: 0, initiate: 1, adept: 2, admin: 3 };
const currentUrl = window.location.href;

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".checkout-btn");
  if (!buttons.length || !auth) return;

  onAuthStateChanged(auth, async (user) => {
    const rawTier = user
      ? ((await user.getIdTokenResult()).claims.tier || localStorage.getItem("tgk-tier") || "free")
      : "free";
    const currentTier = rawTier.toString().toLowerCase();

    console.log("[Membership] Detected tier:", currentTier);

    buttons.forEach(btn => {
      const priceId = btn.dataset.priceId;
      const card = btn.closest(".gnostic-card");
      const targetTier = card?.dataset.tier?.toLowerCase();

      if (!priceId || !targetTier) return;

      const currentRank = tierRank[currentTier] ?? 0;
      const targetRank = tierRank[targetTier] ?? 0;

      if (currentRank >= targetRank) {
        btn.textContent = targetTier === "adept" ? "Active" : "Upgrade Later";
        btn.disabled = true;
        btn.classList.add("locked");
        return;
      }

      if (!user) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.setItem("tgk-return-url", currentUrl);
          window.location.href = "/signin/";
        });
        return;
      }

      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        btn.disabled = true;
        btn.textContent = "Loading...";

        try {
          const res = await fetch("/.netlify/functions/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              priceId,
              uid: user.uid,
              email: user.email,
              returnUrl: currentUrl
            })
          });

          if (!res.ok) throw new Error(await res.text());
          const { sessionId } = await res.json();

          const stripe = Stripe("{{ env.STRIPE_PUBLISHABLE_KEY }}");
          await stripe.redirectToCheckout({ sessionId });
        } catch (err) {
          console.error("[Membership] Checkout error:", err);
          alert("Checkout failed: " + err.message);
          btn.disabled = false;
          btn.textContent = btn.dataset.originalText || "Join";
        }
      });

      if (!btn.dataset.originalText) {
        btn.dataset.originalText = btn.textContent;
      }
    });
  });
});
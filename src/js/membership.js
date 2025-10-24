document.addEventListener("DOMContentLoaded", () => {
  const stripe = Stripe("pk_live_xxxxxxxxxxxxxxxxx"); // or test key
  const checkoutButtons = document.querySelectorAll(".checkout-btn");

  checkoutButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const priceId = btn.getAttribute("data-price");
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        successUrl: window.location.origin + "/dashboard/",
        cancelUrl: window.location.origin + "/membership/",
      });
      if (error) alert(error.message);
    });
  });
});

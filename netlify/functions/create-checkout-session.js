// netlify/functions/create-checkout-session.js
exports.handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "STRIPE_SECRET_KEY missing" });
  const stripe = require("stripe")(key);

  try {
    const { priceId, successUrl, cancelUrl } = JSON.parse(event.body || "{}");
    if (!priceId) return json(400, { error: "Missing priceId" });

    const site = process.env.SITE_URL || "http://localhost:8888";

    // Decide the Checkout mode
    let mode = "subscription";
    const LIFETIME_IDS = (process.env.PRICE_FULL_LIFETIME_IDS || "")
      .split(",").map(s => s.trim()).filter(Boolean);

    if (LIFETIME_IDS.includes(priceId)) {
      mode = "payment";
    } else {
      // Fallback: look up the price to see if it's recurring
      try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price?.recurring) mode = "payment"; // one-time
      } catch (_) {
        // If lookup fails, keep default "subscription"
      }
    }

    const params = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl || site + "/account/"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || site + "/subscribe/",
      allow_promotion_codes: true
    };

    const session = await stripe.checkout.sessions.create(params);
    return json(200, { id: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Server error" });
  }
};

function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

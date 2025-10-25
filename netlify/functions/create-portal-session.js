export const handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "STRIPE_SECRET_KEY missing" });
  const stripe = require("stripe")(key);

  try {
    const { customerId, returnUrl, email } = JSON.parse(event.body || "{}");
    let customer = customerId;

    if (!customer && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length) customer = customers.data[0].id;
    }
    if (!customer) return json(400, { error: "Missing customerId or email" });

    const site = process.env.SITE_URL || "http://localhost:8888";
    const sess = await stripe.billingPortal.sessions.create({
      customer,
      return_url: returnUrl || site + "/account/"
    });
    return json(200, { url: sess.url });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Server error" });
  }
};
function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

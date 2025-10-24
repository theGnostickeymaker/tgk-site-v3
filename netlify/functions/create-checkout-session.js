// /netlify/functions/create-stripe-customer.js
import Stripe from "stripe";

export async function handler(event) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STRIPE_SECRET_KEY missing" }),
    };
  }

  const stripe = new Stripe(key);
  const { email, token } = JSON.parse(event.body || "{}");

  try {
    const customer = await stripe.customers.create({
      email,
      metadata: { firebase_token: token },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, customer }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

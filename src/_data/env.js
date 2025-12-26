// src/_data/env.js

export default {
  // Stripe publishable key for client-side Stripe.js
  STRIPE_PUBLISHABLE_KEY: (process.env.STRIPE_PUBLISHABLE_KEY || "").trim(),

  // Entitlement mapping lists (server-side usage and/or debug)
  PRICE_INITIATE_IDS: (process.env.PRICE_INITIATE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  PRICE_FULL_IDS: (process.env.PRICE_FULL_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  PRICE_FULL_LIFETIME_IDS: (process.env.PRICE_FULL_LIFETIME_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

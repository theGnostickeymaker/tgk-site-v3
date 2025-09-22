export default {
  PRICE_INITIATE_IDS: (process.env.PRICE_INITIATE_IDS || "").split(",").filter(Boolean),
  PRICE_FULL_IDS: (process.env.PRICE_FULL_IDS || "").split(",").filter(Boolean),
  PRICE_FULL_LIFETIME_IDS: (process.env.PRICE_FULL_LIFETIME_IDS || "").split(",").filter(Boolean),
};

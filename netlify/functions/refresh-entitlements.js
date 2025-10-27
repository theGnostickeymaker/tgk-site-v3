import crypto from "crypto";
import Stripe from "stripe";

const INITIATE_IDS = (process.env.PRICE_INITIATE_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const FULL_IDS     = (process.env.PRICE_FULL_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
const FULL_LIFEIDS = (process.env.PRICE_FULL_LIFETIME_IDS || "").split(",").map(s => s.trim()).filter(Boolean);

export const handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "STRIPE_SECRET_KEY missing" });

  const stripe = new Stripe(key);
  try {
    const { token } = JSON.parse(event.body || "{}");
    if (!token) return json(400, { error: "missing token" });

    // Optionally expand session if used post-checkout
    let tier = "free";
    // You can modify here if you attach tier to JWT via Firebase custom claims

    const cookie = makeCookie({ tier, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 });
    return {
      statusCode: 200,
      headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ tier })
    };
  } catch (e) {
    console.error("[TGK] refresh-entitlements error:", e);
    return json(500, { error: "server" });
  }
};

function makeCookie(payload) {
  const secret = process.env.APP_SECRET || "";
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const token = `${payloadB64}.${sig}`;
  const secure = (process.env.SITE_URL || "").startsWith("https://") ? "; Secure" : "";
  return `tgk_ent=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`;
}

function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

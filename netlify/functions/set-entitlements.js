const crypto = require("crypto");

const INITIATE_IDS = (process.env.PRICE_INITIATE_IDS || "").split(",").map(s=>s.trim()).filter(Boolean);
const FULL_IDS     = (process.env.PRICE_FULL_IDS || "").split(",").map(s=>s.trim()).filter(Boolean);
const FULL_LIFEIDS = (process.env.PRICE_FULL_LIFETIME_IDS || "").split(",").map(s=>s.trim()).filter(Boolean);

export const handler = async (event) => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "STRIPE_SECRET_KEY missing" });
  const stripe = require("stripe")(key);

  try {
    const { session_id } = JSON.parse(event.body || "{}");
    if (!session_id) return json(400, { error: "missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id, { expand: ["line_items.data.price"] });
    const li = session?.line_items?.data?.[0];
    const priceId = li?.price?.id;
    if (!priceId) return json(400, { error: "no price id" });

    let tier = "free";
    if (INITIATE_IDS.includes(priceId)) tier = "initiate";
    if (FULL_IDS.includes(priceId) || FULL_LIFEIDS.includes(priceId)) tier = "adept";

    const cookie = makeCookie({ tier, exp: Math.floor(Date.now()/1000) + 60*60*24*30 });
    return { statusCode: 200, headers: { "Set-Cookie": cookie, "Content-Type": "application/json" }, body: JSON.stringify({ tier }) };
  } catch (e) {
    console.error(e);
    return json(500, { error: "server" });
  }
};

function makeCookie(payload) {
  const secret = process.env.APP_SECRET || "";
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = require("crypto").createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const token = `${payloadB64}.${sig}`;
  const secure = (process.env.SITE_URL || "").startsWith("https://") ? "; Secure" : "";
  return `tgk_ent=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${60*60*24*30}; SameSite=Lax${secure}`;
}


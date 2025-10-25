// verify-entitlement.js
// Validates the signed tgk_ent cookie and returns tier if valid

const crypto = require("crypto");

export const handler = async (event) => {
  const cookieHeader = event.headers.cookie || "";
  const match = cookieHeader.split("; ").find(c => c.startsWith("tgk_ent="));
  if (!match) return json(401, { error: "no cookie" });

  try {
    const token = decodeURIComponent(match.split("=")[1]);
    const [payloadB64, sig] = token.split(".");
    const secret = process.env.APP_SECRET || "";
    const expected = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
    if (sig !== expected) return json(401, { error: "invalid" });

    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"));
    if (payload.exp < Math.floor(Date.now() / 1000))
      return json(401, { error: "expired" });

    return json(200, { tier: payload.tier });
  } catch (e) {
    console.error(e);
    return json(500, { error: "server" });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

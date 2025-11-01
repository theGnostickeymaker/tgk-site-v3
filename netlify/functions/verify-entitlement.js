// 🜂 TGK — Netlify Function: Verify Entitlement Cookie
// Version: 3.6 (Basil Standard, 2025-10-27)
// Validates signed entitlement cookie (tgk_ent) → returns access tier

import crypto from "crypto";

export const handler = async (event) => {
  try {
    const cookieHeader = event.headers.cookie || "";
    const match = cookieHeader.split("; ").find((c) => c.startsWith("tgk_ent="));
    if (!match) return json(401, { error: "no_cookie" });

    const token = decodeURIComponent(match.split("=")[1] || "");
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return json(401, { error: "malformed" });

    const secret = process.env.APP_SECRET || "";
    if (!secret) {
      console.error("[TGK] ⚠ APP_SECRET missing in environment");
      return json(500, { error: "server_config" });
    }

    // 🧮 Compute expected signature (constant-time check)
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBytes = new Uint8Array(Buffer.from(sig, "utf8"));
    const expBytes = new Uint8Array(Buffer.from(expected, "utf8"));
    const isValidSig =
      sigBytes.length === expBytes.length &&
      crypto.timingSafeEqual(sigBytes, expBytes);

    if (!isValidSig) return json(401, { error: "invalid_signature" });

    // 🜂 Decode and verify expiry
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf8")
    );
    if (payload.exp < Math.floor(Date.now() / 1000))
      return json(401, { error: "expired" });

    console.log(`[TGK] ✅ Entitlement verified → ${payload.tier}`);
    return json(200, { tier: payload.tier, exp: payload.exp });
  } catch (err) {
    console.error("[TGK] ❌ verify-entitlement error:", err);
    return json(500, { error: "server" });
  }
};

// 🜂 JSON Helper
function json(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-TGK-Security": "verified",
    },
    body: JSON.stringify(body),
  };
}

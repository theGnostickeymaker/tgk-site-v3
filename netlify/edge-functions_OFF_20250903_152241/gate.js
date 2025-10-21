// netlify/edge-functions/gate.js
export const config = { path: "/gated/*" };

const enc = new TextEncoder();

export default async function handler(request, context) {
  const url = new URL(request.url);

  // Expect paths like /gated/{requiredTier}/...
  const parts = url.pathname.split("/").filter(Boolean); // ["gated","initiate",...]
  const requiredTier = parts[1];
  if (!requiredTier) return context.next();

  const token = getCookie(request.headers.get("cookie") || "", "tgk_ent");
  const ent = await verifyToken(token, Deno.env.get("APP_SECRET") || "");

  if (ent && hasAccess(ent.tier, requiredTier)) {
    return context.next();
  }

  const siteUrl = Deno.env.get("SITE_URL") || `${url.protocol}//${url.host}`;
  return Response.redirect(`${siteUrl}/subscribe/?need=${requiredTier}`, 302);
}

function getCookie(cookie, name) {
  const m = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function verifyToken(token, secret) {
  if (!token) return null;
  try {
    const [payloadB64, sigB64] = token.split(".");
    const expected = await hmac(payloadB64, secret);
    if (!timingSafeEqual(sigB64, expected)) return null;

    const json = JSON.parse(atobUrl(payloadB64));
    if (!json.exp || Date.now() / 1000 >= json.exp) return null;
    return json;
  } catch {
    return null;
  }
}

function hasAccess(userTier, requiredTier) {
  const rank = { free: 0, initiate: 1, adept: 2 };
  return (rank[userTier] ?? -1) >= (rank[requiredTier] ?? 99);
}

async function hmac(input, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(input));
  return b64url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
function b64url(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
}
function atobUrl(s) {
  return atob(s.replace(/-/g, "+").replace(/_/g, "/"));
}

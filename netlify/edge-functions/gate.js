// 🜂 TGK — Netlify Edge Gate (v2)
// Purpose: Protect gated pages and verify membership tier
// Runs at CDN edge before page delivery

import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

export default async function gate(request, context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only protect gated routes
  if (!pathname.startsWith("/gated/")) {
    return context.next();
  }

  // Retrieve token (from cookie or header)
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "") ||
    getCookie(request, "tgk_ent");

  if (!token) {
    console.log("[TGK Edge] ❌ No token found — redirecting to /signin/");
    return Response.redirect(`${url.origin}/signin/`, 302);
  }

  try {
    const secret = Deno.env.get("APP_SECRET") || "";
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    const tier = payload.tier || "free";
    console.log(`[TGK Edge] ✅ Authenticated as ${payload.email || "unknown"} (${tier})`);

    // === 🜂 Access Logic ===
    const allowedTiers = ["initiate", "adept", "admin"];
    if (allowedTiers.includes(tier)) {
      console.log(`[TGK Edge] ✅ Tier access granted: ${tier}`);
      return context.next();
    }

    console.log(`[TGK Edge] ⚠ Free user (${tier}) — redirecting to upgrade.`);
    return Response.redirect(`${url.origin}/membership/`, 302);
  } catch (err) {
    console.error("[TGK Edge] ❌ Invalid token:", err.message);
    return Response.redirect(`${url.origin}/signin/`, 302);
  }
}

/* 🔹 Helper: Get cookie by name */
function getCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v];
    })
  );
  return cookies[name];
}

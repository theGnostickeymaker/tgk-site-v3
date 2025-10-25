// 🜂 TGK — Netlify Edge Gate (v2)
// Purpose: protect gated pages & verify membership tier
// Runs at the CDN edge before serving scroll content.

import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

export default async function gate(request, context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ✅ Only protect /gated/ routes (expand later if needed)
  if (!pathname.startsWith("/gated/")) {
    return context.next();
  }

  // 🔹 Try header first, then cookie
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader?.replace("Bearer ", "") ||
    getCookie(request, "tgk_ent") ||
    null;

  if (!token) {
    console.log("[TGK Edge] ❌ No token found — redirecting to /signin/");
    return Response.redirect(`${url.origin}/signin/`, 302);
  }

  try {
    const secret = Deno.env.get("APP_SECRET") || "";
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    console.log(`[TGK Edge] ✅ Authenticated as ${payload.email || "unknown"}`);

    // 🔹 Basic tier check
    if (payload.tier && payload.tier !== "free") {
      console.log(`[TGK Edge] ✅ Tier access granted: ${payload.tier}`);
      return context.next();
    }

    console.log("[TGK Edge] ⚠ Free user — redirecting to membership page.");
    return Response.redirect(`${url.origin}/membership/`, 302);
  } catch (err) {
    console.error("[TGK Edge] ❌ Invalid or expired token:", err.message);
    return Response.redirect(`${url.origin}/signin/`, 302);
  }
}

/**
 * 🧩 Cookie parser for Edge Runtime (no document.cookie in Deno)
 * Reads cookies from the incoming request headers.
 */
function getCookie(request, name) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      try {
        return decodeURIComponent(cookie.split("=")[1]);
      } catch {
        return null;
      }
    }
  }
  return null;
}

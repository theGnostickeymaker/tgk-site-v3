// 🜂 TGK — Netlify Edge Gate (v1)
// Purpose: protect gated pages & verify membership tier
// Runs at the CDN edge before serving scroll content.

import { jwtVerify } from "https://deno.land/x/jose@v4.14.4/index.ts";

export default async (request, context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only protect /gated/ routes (you can add more later)
  if (!pathname.startsWith("/gated/")) {
    return context.next();
  }

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("[TGK Edge] ❌ No token found — redirecting to /signin/");
    return Response.redirect(`${url.origin}/signin/`, 302);
  }

  try {
    const secret = Deno.env.get("APP_SECRET");
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    console.log(`[TGK Edge] ✅ Authenticated as ${payload.email}`);

    // Basic tier check example
    if (payload.tier && payload.tier !== "free") {
      console.log(`[TGK Edge] ✅ Tier access granted: ${payload.tier}`);
      return context.next();
    } else {
      console.log("[TGK Edge] ⚠ Free user — redirecting to upgrade.");
      return Response.redirect(`${url.origin}/membership/`, 302);
    }
  } catch (err) {
    console.error("[TGK Edge] ❌ Invalid token:", err);
    return Response.redirect(`${url.origin}/signin/`, 302);
  }
};

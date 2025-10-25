/* ===========================================================
   🗝 TGK Gate.js v1.0 — Frontend Access Control
   Reads the signed tgk_ent cookie, compares required vs user tier,
   and hides or redirects accordingly.
   Tiers: free < initiate < adept
   =========================================================== */

const TIERS = ["free", "initiate", "adept"];

function readEntitlementCookie() {
  const c = document.cookie.split("; ").find(x => x.startsWith("tgk_ent="));
  if (!c) return null;
  try {
    const token = decodeURIComponent(c.split("=")[1]);
    const [payloadB64] = token.split(".");
    return JSON.parse(atob(payloadB64)); // { tier, exp }
  } catch {
    return null;
  }
}

function hasEnoughTier(current, required) {
  const ci = TIERS.indexOf(current || "free");
  const ri = TIERS.indexOf(required || "free");
  return ci >= ri;
}

function redirectToSignIn(next) {
  const url = `/signin/?next=${encodeURIComponent(next || location.pathname)}`;
  window.location.href = url;
}

// === Main gate logic ===
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const required = (body.dataset.tier || "free").trim();
  if (required === "free") return;

  const ent = readEntitlementCookie();
  const now = Math.floor(Date.now() / 1000);

  if (!ent || !ent.tier || !ent.exp || ent.exp < now) {
    redirectToSignIn();
    return;
  }

  if (!hasEnoughTier(ent.tier, required)) {
    redirectToSignIn();
    return;
  }

  // Unlock content
  const content = document.getElementById("protected-content");
  const placeholder = document.getElementById("protected-placeholder");
  if (content) content.style.display = "";
  if (placeholder) placeholder.remove();
});

// === Card click interception ===
document.addEventListener("click", e => {
  const a = e.target.closest("a.card-link.locked");
  if (!a) return;
  const required = a.dataset.required;
  const ent = readEntitlementCookie();
  const ok =
    ent &&
    ent.tier &&
    hasEnoughTier(ent.tier, required) &&
    ent.exp > Math.floor(Date.now() / 1000);
  if (!ok) {
    e.preventDefault();
    window.location.href = `/signin/?next=${encodeURIComponent(
      a.getAttribute("href")
    )}`;
  }
});

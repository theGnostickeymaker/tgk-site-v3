/* ===========================================================
   TGK Gate System v9.1 — Phase D
   Adds advisory session-cache for gate decisions
   Preserves verified-tier + soft-gating behaviour
   =========================================================== */

import { app } from "/js/firebase-init.js";
import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getCached, setCached } from "/js/session-cache.js";

const auth = getAuth(app);

const RETURN_KEY = "tgk-return-url";

/*
  Access ladder (ranked):
    free < verified < initiate < adept < admin
*/
const rankMap = {
  free: 0,
  verified: 1,
  initiate: 2,
  adept: 3,
  admin: 4
};

// Gate decisions should be short-lived
const GATE_TTL_MS = 2 * 60 * 1000;

/* -----------------------------------------------------------
   Return URL helpers (unchanged)
----------------------------------------------------------- */
export function saveReturnUrl(url = window.location.href) {
  try {
    if (!url) return;

    const origin = window.location.origin;
    if (!url.startsWith(origin)) return;

    const u = new URL(url);
    if (
      u.pathname.startsWith("/signin") ||
      u.pathname.startsWith("/signup") ||
      u.pathname.startsWith("/verify-email") ||
      u.pathname.startsWith("/reset-password") ||
      u.pathname === "/"
    ) return;

    sessionStorage.setItem(RETURN_KEY, url);
    localStorage.setItem(RETURN_KEY, url);

    console.log("[Gate] Saved return URL:", url);
  } catch (e) {
    console.warn("[Gate] Could not save return URL:", e?.message || e);
  }
}

export function consumeReturnUrl() {
  const url =
    sessionStorage.getItem(RETURN_KEY) ||
    localStorage.getItem(RETURN_KEY);

  if (!url) return false;
  if (!url.startsWith(window.location.origin)) return false;

  sessionStorage.removeItem(RETURN_KEY);
  localStorage.removeItem(RETURN_KEY);

  console.log("[Gate] Returning to:", url);
  window.location.replace(url);
  return true;
}

window.__TGK_GATE__ = { saveReturnUrl, consumeReturnUrl };

/* -----------------------------------------------------------
   Init
----------------------------------------------------------- */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGate);
} else {
  initGate();
}

/* -----------------------------------------------------------
   Main gate controller
----------------------------------------------------------- */
function initGate() {
  console.log("[Gate] Initialising...");

  const path = window.location.pathname;

  if (
    path.startsWith("/signin") ||
    path.startsWith("/signup") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/reset-password")
  ) {
    console.log("[Gate] Auth page detected, gate disabled.");
    return;
  }

  const locked = Array.from(document.querySelectorAll(".locked-page"));
  if (!locked.length) {
    console.log("[Gate] No locked content, skipping gate.");
    return;
  }

  console.log(`[Gate] ${locked.length} locked blocks found.`);

  wireLockUiHandlers();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log("[Gate] No user signed in, locked content remains locked.");
      return;
    }

    await applyGate(user, locked);
  });
}

/* -----------------------------------------------------------
   Cache helpers
----------------------------------------------------------- */
function gateCacheKey(uid) {
  return `gate:${uid}:${window.location.pathname}`;
}

/* -----------------------------------------------------------
   Resolve access rank and apply unlocks (Phase D)
----------------------------------------------------------- */
async function applyGate(user, lockedBlocks) {
  try {
    const cacheKey = gateCacheKey(user.uid);
    const cached = getCached(cacheKey);

    // Cached decisions are advisory only
    if (cached && typeof cached.accessRank === "number") {
      console.log("[Gate] Cache hit, applying cached gate decision");
      applyBlocksFromDecision(cached, lockedBlocks, user);
    }

    // Always refresh verification state
    try { await user.reload(); } catch {}

    // Refresh token and claims
    await user.getIdToken(true);
    const tk = await getIdTokenResult(user);
    const claims = tk?.claims || {};

    const membershipTier =
      claims.tier ||
      localStorage.getItem("tgk-tier") ||
      "free";

    if (claims.tier) localStorage.setItem("tgk-tier", claims.tier);

    const membershipRank = rankMap[membershipTier] ?? 0;
    const verifiedRank = user.emailVerified ? rankMap.verified : rankMap.free;

    const accessRank = Math.max(membershipRank, verifiedRank);

    const decision = {
      accessRank,
      membershipTier,
      emailVerified: !!user.emailVerified
    };

    console.log(
      `[Gate] membership=${membershipTier} (rank ${membershipRank}), emailVerified=${!!user.emailVerified}, accessRank=${accessRank}`
    );

    applyBlocksFromDecision(decision, lockedBlocks, user);

    setCached(cacheKey, decision, GATE_TTL_MS);
  } catch (err) {
    console.error("[Gate] Gate resolution failed:", err);
  }
}

function applyBlocksFromDecision(decision, lockedBlocks, user) {
  lockedBlocks.forEach((block) => {
    const requiredTier =
      (block.dataset.requiredTier || "initiate").trim();
    const requiredRank = rankMap[requiredTier] ?? rankMap.initiate;

    console.log(
      `[Gate] Block requires ${requiredTier} (rank ${requiredRank})`
    );

    if (decision.accessRank >= requiredRank) {
      unlockBlock(block);
    } else if (requiredTier === "verified") {
      renderVerifyPlaceholder(block, user);
    }
  });
}

/* -----------------------------------------------------------
   Unlock block
----------------------------------------------------------- */
function unlockBlock(block) {
  block.classList.add("unlocked-page");
  block.querySelector(".locked-placeholder")?.remove();

  const content = block.querySelector(".page-content");
  if (content) {
    content.style.display = "block";
    content.style.opacity = "1";
  }
}

/* -----------------------------------------------------------
   Lock UI handlers (unchanged)
----------------------------------------------------------- */
function wireLockUiHandlers() {
  document.addEventListener("click", async (e) => {
    const signInBtn = e.target.closest(".signin-btn");
    if (signInBtn) {
      e.preventDefault();
      saveReturnUrl();
      window.location.href = "/signin/";
      return;
    }

    const resendBtn = e.target.closest(".resend-verify-btn");
    if (resendBtn) {
      e.preventDefault();

      const u = auth.currentUser;
      if (!u) {
        saveReturnUrl();
        window.location.href = "/signin/";
        return;
      }

      resendBtn.disabled = true;
      const original = resendBtn.textContent;
      resendBtn.textContent = "Sending...";

      try {
        await sendEmailVerification(u);
        toastInto(resendBtn, `Verification link sent to ${u.email}.`);
      } catch (err) {
        toastInto(resendBtn, `Could not send link: ${err?.message || err}`);
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = original || "Resend verification link";
      }
      return;
    }

    const refreshBtn = e.target.closest(".refresh-verify-btn");
    if (refreshBtn) {
      e.preventDefault();

      const u = auth.currentUser;
      if (!u) {
        saveReturnUrl();
        window.location.href = "/signin/";
        return;
      }

      refreshBtn.disabled = true;
      const original = refreshBtn.textContent;
      refreshBtn.textContent = "Checking...";

      try {
        await u.reload();
        await u.getIdToken(true);

        if (u.emailVerified) {
          window.location.reload();
          return;
        }

        toastInto(
          refreshBtn,
          "Not verified yet. Please click the link in your email, then refresh again."
        );
      } catch (err) {
        toastInto(refreshBtn, `Could not refresh state: ${err?.message || err}`);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = original || "I have verified, refresh";
      }
      return;
    }
  });
}

function toastInto(btn, message) {
  const host = btn.closest(".locked-placeholder") || document.body;
  const el = document.createElement("div");
  el.className = "tgk-inline-note";
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

/* -----------------------------------------------------------
   Verified placeholder renderer (unchanged)
----------------------------------------------------------- */
function renderVerifyPlaceholder(block, user) {
  const ph = block.querySelector(".locked-placeholder");
  if (!ph) return;
  if (ph.dataset.mode === "verified") return;
  ph.dataset.mode = "verified";

  const email = user?.email || "your email";
  const signedIn = !!user;

  ph.innerHTML = `
    <div class="gate-card">
      <h2 class="gate-title">Verify your email to unlock this episode</h2>
      <p class="gate-body">
        This episode is free, but it requires a verified account.
        Check your inbox for a link sent to <strong>${escapeHtml(email)}</strong>.
      </p>

      <div class="gate-actions">
        ${signedIn ? `
          <button class="btn btn-outline resend-verify-btn" type="button">
            Resend verification link
          </button>
          <button class="btn refresh-verify-btn" type="button">
            I have verified, refresh
          </button>
        ` : `
          <button class="btn signin-btn" type="button">
            Sign in to verify
          </button>
        `}
      </div>

      <p class="gate-footnote">
        Tip: If you verified in another tab, hit refresh and the page will unlock.
      </p>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

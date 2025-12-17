/* ===========================================================
   🔖 TGK — Bookmarks System v4.0
   Unified metadata-aware bookmarks for Pages + Dashboard
   =========================================================== */
console.log("[TGK] Bookmarks v4.0 loaded successfully");

import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { app } from "/js/firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/* ===========================================================
   ✦ Toast Helper
   =========================================================== */
function showToast(msg, type = "info") {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    document.body.appendChild(c);
  }
  const t = document.createElement("div");
  t.className = `tgk-toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

/* ===========================================================
   ✦ Resolve Tier
   =========================================================== */
async function resolveUserTier(user) {
  let tier = "free";
  try {
    const token = await getIdTokenResult(user);
    if (token?.claims?.tier) tier = token.claims.tier;
    else {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().tier) tier = snap.data().tier;
    }
  } catch (err) {
    console.warn("[TGK] Tier resolve error:", err);
  }
  localStorage.setItem("tgk-tier", tier);
  return tier;
}

/* ===========================================================
   ✦ PAGE Bookmark Toggle (metadata-aware)
   =========================================================== */
async function toggleBookmark(btn) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to bookmark pages.");
    return;
  }

  const pageId = btn.dataset.bookmarkId || window.location.pathname;
  const permalink = window.location.pathname;
  const ref = doc(db, "users", user.uid, "bookmarks", pageId);
  const snap = await getDoc(ref);

  // 🜂 Pull metadata from embedded <script id="tgk-page-meta">
  let meta = {};
  try {
    const metaEl = document.getElementById("tgk-page-meta");
    if (metaEl) meta = JSON.parse(metaEl.textContent);
  } catch (e) {
    console.warn("[TGK] Metadata parse error:", e);
  }

  try {
    if (snap.exists()) {
      await deleteDoc(ref);
      btn.classList.remove("bookmarked");
      showToast("🩸 Removed from bookmarks", "remove");
    } else {
      await setDoc(ref, {
        id: pageId,
        permalink,
        type: "page",
        created: Date.now(),
        ...meta // inject all front-matter fields here
      });
      btn.classList.add("bookmarked");
      showToast("💾 Saved to bookmarks", "success");
    }
  } catch (err) {
    console.error("[TGK] Bookmark error:", err);
    showToast("⚠️ Bookmark failed", "error");
  }
}

/* ===========================================================
   ✦ Bind Page Buttons
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".page-bookmark").forEach((btn) => {
    btn.addEventListener("click", () => toggleBookmark(btn));
  });
});

/* ===========================================================
   ✦ Glyph + Text helpers
   =========================================================== */
function inferGlyph(permalink = "") {
  if (permalink.includes("/pillars/the-gnostic-eye/")) return "👁️";
  if (permalink.includes("/pillars/the-obsidian-key/")) return "🗝️";
  if (permalink.includes("/pillars/the-vault/")) return "🔒";
  if (permalink.includes("/pillars/the-resonant-key/")) return "🎼";
  if (permalink.includes("/pillars/the-keymakers-dream/")) return "🜂";
  if (permalink.includes("/pillars/childrens-corner/")) return "🧒";
  if (permalink.includes("/pillars/tgk-shop/")) return "🛍️";
  if (permalink.includes("/pillars/tgk-community/")) return "🗣️";
  if (permalink.includes("/pillars/the-teachings/")) return "☥";
  return "🔖";
}

function beautify(str = "") {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/* ===========================================================
   ✦ Dashboard Renderer — PillarGrid style
   =========================================================== */
function renderPillarGrid(bookmarks) {
  const mount = document.getElementById("bookmark-grid-mount");
  if (!mount) return;

  const section = document.createElement("section");
  section.className = "pillar-grid";

  const grid = document.createElement("div");
  grid.className = "portal-grid";

  bookmarks.sort((a, b) => (b.created || 0) - (a.created || 0));

  bookmarks.forEach((it) => {
    const title = it.title || "Untitled";
    const href = it.permalink || "#";

    const article = document.createElement("article");
    article.className = "gnostic-card";
    article.dataset.id = it.id;

    article.innerHTML = `
      <a class="card-link" href="${href}">
        <div class="card-body">
          <div class="card-glyph" aria-hidden="true">${it.glyph || inferGlyph(it.permalink)}</div>
          <h3 class="card-title">${title}</h3>
          ${
            it.series || it.episodeNum || it.partNum
              ? `<p class="card-desc small">
                  ${[
                    it.series ? beautify(it.series) : "",
                    it.episodeNum ? `Ep. ${it.episodeNum}` : "",
                    it.partNum ? `Part ${it.partNum}` : ""
                  ]
                    .filter(Boolean)
                    .join(" — ")}
                 </p>`
              : ""
          }
        </div>
      </a>
      <button class="remove-bookmark-icon" title="Remove Bookmark">
  ✕
</button>
    `;

    grid.appendChild(article);
  });

  section.appendChild(grid);
  mount.innerHTML = "";
  mount.appendChild(section);

   // ✦ Bind remove (fixed selector for ✕ icon)
  mount.querySelectorAll(".remove-bookmark-icon").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = e.currentTarget.closest(".gnostic-card");
      const id = card?.dataset.id;
      if (!id) return;

      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "bookmarks", id));
        card.style.transition = "opacity .25s ease, transform .25s ease";
        card.style.opacity = "0";
        card.style.transform = "scale(.97) translateY(4px)";
        setTimeout(() => card.remove(), 250);
        showToast("🩸 Removed from Dashboard", "remove");

        // Show fallback if no bookmarks remain
        if (!mount.querySelectorAll(".gnostic-card").length)
          document.getElementById("no-bookmarks")?.removeAttribute("hidden");
      } catch (err) {
        console.error("[TGK] Remove error:", err);
      }
    });

    // ✦ Keyboard accessibility (Enter/Space)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });
} // ✅ closes renderPillarGrid()


/* ===========================================================
   ✦ Auth State + Dashboard Loader
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  const loading = document.getElementById("bookmark-loading");
  const noBookmarks = document.getElementById("no-bookmarks");

  if (!user) {
    if (loading) loading.textContent = "Please sign in to view your Dashboard.";
    return;
  }

  const mount = document.getElementById("bookmark-grid-mount");
  if (!mount) return;

  try {
    const snap = await getDocs(collection(db, "users", user.uid, "bookmarks"));
    if (loading) loading.remove();

    if (snap.empty) {
      if (noBookmarks) noBookmarks.hidden = false;
      return;
    }

    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    renderPillarGrid(items);
  } catch (err) {
    console.error("[Dashboard] Bookmark load error:", err);
    if (loading) loading.textContent = "Error loading bookmarks.";
  }
});

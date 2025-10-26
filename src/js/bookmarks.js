/* ===========================================================
   🔖 TGK — Bookmarks System v3.9.4
   Works across Pages + Dashboard (Firestore + Local)
   =========================================================== */

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
   ✦ PAGE Bookmark Toggle
   =========================================================== */
async function toggleBookmark(btn) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please sign in to bookmark pages.");
    return;
  }

  const pageId = btn.dataset.bookmarkId || window.location.pathname;
  const title = document.title;
  const permalink = window.location.pathname;
  const ref = doc(db, "bookmarks", user.uid, "pages", pageId);
  const snap = await getDoc(ref);

  try {
    if (snap.exists()) {
      await deleteDoc(ref);
      btn.classList.remove("bookmarked");
      btn.classList.add("removing");
      showToast("🩸 Removed from bookmarks", "remove");
    } else {
      await setDoc(ref, {
        id: pageId,
        title,
        permalink,
        type: "page",
        created: Date.now()
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
   ✦ Dashboard Rendering
   =========================================================== */
function renderGroups(groups) {
  const wrapper = document.getElementById("bookmark-groups");
  if (!wrapper) return; // skip on non-dashboard pages
  wrapper.innerHTML = "";

  const titles = { series: "📚 Series", page: "📄 Pages", part: "🔹 Parts" };

  Object.entries(groups).forEach(([type, arr]) => {
    if (!arr?.length) return;
    const section = document.createElement("section");
    section.className = "bookmark-group";
    section.innerHTML = `
      <h3 class="group-heading">${titles[type]} <span class="count">(${arr.length})</span></h3>
      <ul class="bookmark-grid"></ul>`;
    const ul = section.querySelector("ul");
    arr
      .sort((a, b) => b.created - a.created)
      .forEach((it) => {
        const card = document.createElement("li");
        card.className = "dashboard-bookmark-card";
        card.dataset.id = it.id;
        card.innerHTML = `
          <div class="bookmark-glyph">🔖</div>
          <h3 class="bookmark-title">${it.title}</h3>
          <p class="bookmark-meta">${it.type || "page"}</p>
          <div class="card-actions">
            <a href="${it.permalink}" class="btn">Open</a>
            <button class="btn-mini" data-id="${it.id}">Remove</button>
          </div>`;
        ul.appendChild(card);
      });
    wrapper.appendChild(section);
  });

  wrapper.querySelectorAll(".btn-mini").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const card = e.target.closest(".dashboard-bookmark-card");
      card.classList.add("removing");
      try {
        await deleteDoc(doc(db, "bookmarks", auth.currentUser.uid, "pages", id));
        showToast("🩸 Removed from Dashboard", "remove");
        await sleep(400);
        card.remove();
      } catch (err) {
        console.error("[TGK] Remove error:", err);
      }
    });
  });
}

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

  const nameEl = document.getElementById("user-name");
  const tierEl = document.getElementById("user-tier");
  const upgradeCTA = document.getElementById("upgrade-cta");

  if (nameEl) nameEl.textContent = user.displayName || user.email.split("@")[0];
  let tier = await resolveUserTier(user);
  if (user.email === "the.keymaker@thegnostickey.com") tier = "admin";

  if (tierEl) {
    tierEl.textContent = tier.toUpperCase();
    if (["adept", "admin"].includes(tier))
      tierEl.classList.add("glow-tier");
  }

  if (upgradeCTA && ["free", "initiate"].includes(tier))
    upgradeCTA.hidden = false;

  // 🜂 Load bookmarks only on dashboard
  const wrapper = document.getElementById("bookmark-groups");
  if (!wrapper) return;

  try {
    const snap = await getDocs(collection(db, "bookmarks", user.uid, "pages"));
    if (loading) loading.remove();

    if (snap.empty) {
      if (noBookmarks) noBookmarks.hidden = false;
      return;
    }

    const groups = { series: [], page: [], part: [] };
    snap.forEach((d) => {
      const data = d.data();
      groups[data.type || "page"].push({ id: d.id, ...data });
    });
    renderGroups(groups);
  } catch (err) {
    console.error("[Dashboard] Bookmark load error:", err);
    if (loading) loading.textContent = "Error loading bookmarks.";
  }
});

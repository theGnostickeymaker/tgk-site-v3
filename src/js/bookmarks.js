/* ===========================================================
   🔖 TGK — Dashboard & Bookmark System (v4.2)
   Animated collapsible groups + memory + global controls
   =========================================================== */

import {
  getAuth,
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { app } from "/js/firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);
const GROUP_STATE_KEY = "tgk_dashboard_groups";

/* ===========================================================
   ✦ Utilities
   =========================================================== */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

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

function loadGroupState() {
  try {
    return JSON.parse(localStorage.getItem(GROUP_STATE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveGroupState(state) {
  localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(state));
}

/* ===========================================================
   ✦ Resolve User Tier
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
   ✦ Build Href from pageId (Legacy Fallback)
   =========================================================== */
function buildHrefFromId(pageId) {
  if (!pageId) return "/";
  if (pageId.includes("part-")) {
    const parts = pageId.split("-");
    const idx = parts.indexOf("part");
    const prefix = parts.slice(0, idx).join("/");
    const suffix = parts.slice(idx, idx + 2).join("-");
    return `/pillars/${prefix}/${suffix}/`;
  }
  return `/pillars/${pageId.replace(/-/g, "/")}/`;
}

/* ===========================================================
   ✦ Global Expand / Collapse Controls
   =========================================================== */
function renderGlobalControls(wrapper) {
  const controls = document.createElement("div");
  controls.className = "bookmark-controls";
  controls.innerHTML = `
    <button id="expand-all" class="btn small">Expand All</button>
    <button id="collapse-all" class="btn small outline">Collapse All</button>
  `;
  wrapper.parentNode.insertBefore(controls, wrapper);

  document.getElementById("expand-all").addEventListener("click", () => {
    document.querySelectorAll(".bookmark-group").forEach((s) => expandSection(s));
    saveGroupState({ series: true, page: true, part: true });
  });

  document.getElementById("collapse-all").addEventListener("click", () => {
    document.querySelectorAll(".bookmark-group").forEach((s) => collapseSection(s));
    saveGroupState({ series: false, page: false, part: false });
  });
}

/* ===========================================================
   ✦ Expand / Collapse Helpers (Animated)
   =========================================================== */
function expandSection(section) {
  const grid = section.querySelector(".bookmark-grid");
  const icon = section.querySelector(".toggle-icon");
  section.classList.add("open");
  section.classList.remove("collapsed");
  grid.hidden = false;
  grid.style.maxHeight = grid.scrollHeight + "px";
  icon.textContent = "▴";
}

function collapseSection(section) {
  const grid = section.querySelector(".bookmark-grid");
  const icon = section.querySelector(".toggle-icon");
  section.classList.remove("open");
  section.classList.add("collapsed");
  grid.style.maxHeight = grid.scrollHeight + "px";
  // allow transition to start
  requestAnimationFrame(() => {
    grid.style.maxHeight = "0px";
  });
  icon.textContent = "▾";
  setTimeout(() => (grid.hidden = true), 300);
}

/* ===========================================================
   ✦ Render Bookmarks by Type (Series / Pages / Parts)
   =========================================================== */
function renderGroups(groups) {
  const wrapper = document.getElementById("bookmark-groups");
  wrapper.innerHTML = "";
  const titles = { series: "📚 Series", page: "📄 Pages", part: "🔹 Parts" };
  const savedState = loadGroupState();

  if (!document.querySelector(".bookmark-controls")) renderGlobalControls(wrapper);

  Object.entries(groups).forEach(([type, arr]) => {
    if (!arr?.length) return;
    const isOpen = savedState[type] ?? true;

    const section = document.createElement("section");
    section.className = `bookmark-group ${isOpen ? "open" : "collapsed"}`;
    section.dataset.type = type;
    section.innerHTML = `
      <h3 class="group-heading" tabindex="0" role="button">
        ${titles[type]} <span class="count">(${arr.length})</span>
        <span class="toggle-icon">${isOpen ? "▴" : "▾"}</span>
      </h3>
      <ul class="bookmark-grid" style="max-height:${isOpen ? "none" : "0"}" ${isOpen ? "" : "hidden"}></ul>
    `;

    const ul = section.querySelector("ul");
    arr
      .sort((a, b) => b.created - a.created)
      .forEach((it) => {
        const href = it.permalink || buildHrefFromId(it.id);
        const title =
          it.title ||
          it.id
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        const card = document.createElement("li");
        card.className = "dashboard-bookmark-card";
        card.dataset.id = it.id;
        card.innerHTML = `
          <div class="bookmark-glyph">🔖</div>
          <h3 class="bookmark-title">${title}</h3>
          <p class="bookmark-meta">${it.type || "page"}</p>
          <div class="card-actions">
            <a href="${href}" class="btn">Open</a>
            <button class="btn-mini" data-id="${it.id}">Remove</button>
          </div>`;
        ul.appendChild(card);
      });
    wrapper.appendChild(section);
  });

  /* 🔹 Collapsible group toggle logic + memory */
  wrapper.querySelectorAll(".group-heading").forEach((heading) => {
    heading.addEventListener("click", () => toggleGroup(heading));
    heading.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") toggleGroup(heading);
    });
  });

  function toggleGroup(heading) {
    const section = heading.closest(".bookmark-group");
    const type = section.dataset.type;
    const grid = section.querySelector(".bookmark-grid");
    const state = loadGroupState();

    if (section.classList.contains("open")) {
      collapseSection(section);
      state[type] = false;
    } else {
      expandSection(section);
      state[type] = true;
    }
    saveGroupState(state);
  }

  /* 🔹 Remove button binding */
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
   ✦ Load Dashboard on Auth
   =========================================================== */
onAuthStateChanged(auth, async (user) => {
  const loading = document.getElementById("bookmark-loading");
  const noBookmarks = document.getElementById("no-bookmarks");

  if (!user) {
    loading.textContent = "Please sign in to view your Dashboard.";
    return;
  }

  document.getElementById("user-name").textContent =
    user.displayName || user.email.split("@")[0];

  let tier = await resolveUserTier(user);
  if (user.email === "the.keymaker@thegnostickey.com") tier = "admin";
  document.getElementById("user-tier").textContent = tier.toUpperCase();

  if (["free", "initiate"].includes(tier))
    document.getElementById("upgrade-cta").hidden = false;
  if (["adept", "admin"].includes(tier))
    document.getElementById("user-tier").classList.add("glow-tier");

  try {
    const snap = await getDocs(collection(db, "bookmarks", user.uid, "pages"));
    loading.remove();

    if (snap.empty) {
      noBookmarks.hidden = false;
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
    loading.textContent = "Error loading bookmarks.";
  }
});

/* ===========================================================
   ✦ Stripe Portal Access
   =========================================================== */
document.getElementById("manage-tier")?.addEventListener("click", async () => {
  const user = auth.currentUser;
  const email = user?.email || prompt("Enter your Stripe email:");
  const res = await fetch("/.netlify/functions/create-portal-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data.url) window.location = data.url;
  else alert(data.error || "Portal error");
});

/* ===========================================================
   ✦ Logout Redirect
   =========================================================== */
document.getElementById("logout-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/logout/";
});

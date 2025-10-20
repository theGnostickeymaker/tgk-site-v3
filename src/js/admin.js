(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* =========================
     0) Accent dropdown (persist + apply)
  ========================= */
  const ACCENTS = ["lightgold","gold","eye","obsidian","vault","dream","children","resonant","shop","community"];
  const ACCENT_KEY = "tgk_admin_accent";
  const body = document.body;
  const accentSel = $("#admin-accent");
  const accentSync = $("#accent-sync");

  function applyAccent(accent) {
    ACCENTS.forEach(a => body.classList.remove(a));
    if (ACCENTS.includes(accent)) body.classList.add(accent);
  }
  const savedAccent = localStorage.getItem(ACCENT_KEY);
  const currentAccent = ACCENTS.find(a => body.classList.contains(a));
  const initialAccent = savedAccent || currentAccent || "gold";
  applyAccent(initialAccent);
  if (accentSel) accentSel.value = initialAccent;

  accentSel?.addEventListener("change", () => {
    const val = accentSel.value;
    applyAccent(val);
    localStorage.setItem(ACCENT_KEY, val);
  });
  accentSync?.addEventListener("click", () => {
    const detected = ACCENTS.find(a => body.classList.contains(a)) || "gold";
    accentSel.value = detected;
    localStorage.setItem(ACCENT_KEY, detected);
  });

  /* =========================
     1) Tabs
  ========================= */
  const tabs = $$(".admin-tabs .tab");
  const panels = $$(".tab-panel");
  tabs.forEach(btn =>
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("is-active"));
      panels.forEach(p => p.classList.remove("is-active"));
      btn.classList.add("is-active");
      $("#tab-" + btn.dataset.tab)?.classList.add("is-active");
    })
  );

  /* =========================
     2) To-Do: check, tag, note (persist)
  ========================= */
  const TASK_KEY = "tgk_admin_tasks_v1";
  const META_KEY = "tgk_admin_taskmeta_v1";
  const state = JSON.parse(localStorage.getItem(TASK_KEY) || "{}");
  const meta  = JSON.parse(localStorage.getItem(META_KEY) || "{}"); // { [taskId]: { tags:[], note:"" } }

  function saveTasks() { localStorage.setItem(TASK_KEY, JSON.stringify(state)); }
  function saveMeta()  { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

  $$(".task").forEach(li => {
    const id = li.dataset.id;
    const cb = li.querySelector(".task-check");
    if (!id || !cb) return;

    cb.checked = !!state[id];
    li.classList.toggle("done", cb.checked);
    cb.addEventListener("change", () => {
      state[id] = cb.checked;
      li.classList.toggle("done", cb.checked);
      saveTasks();
    });

    const tools = li.querySelector(".task-tools");
    if (!tools) return;
    const info = meta[id] || {};
    if (info.tags?.length) {
      const b = document.createElement("span");
      b.className = "badge tag-badge";
      b.textContent = info.tags.join(", ");
      tools.prepend(b);
    }
    if (info.note) {
      const b = document.createElement("span");
      b.className = "badge note-badge";
      b.title = info.note;
      b.textContent = "note";
      tools.prepend(b);
    }

    li.querySelector(".tag-btn")?.addEventListener("click", () => {
      const curr = (meta[id]?.tags || []).join(", ");
      const val = prompt("Tags (comma separated):", curr);
      if (val === null) return;
      const tags = val.split(",").map(s => s.trim()).filter(Boolean);
      meta[id] = meta[id] || {};
      meta[id].tags = tags;
      saveMeta();
      location.reload();
    });

    li.querySelector(".note-btn")?.addEventListener("click", () => {
      const curr = meta[id]?.note || "";
      const val = prompt("Note:", curr);
      if (val === null) return;
      meta[id] = meta[id] || {};
      meta[id].note = val.trim();
      saveMeta();
      location.reload();
    });
  });

  /* =========================
     3) Inventory: search + Pillar/Tier filters + persistence
  ========================= */
  const invSearch = $("#inv-search");
  const pillarSel = $("#inv-filter-pillar");
  const tierSel   = $("#inv-filter-tier");
  const gateSel   = $("#gating-preview"); // optional "view as" tier

  function collectDistinct(attr) {
    const vals = new Set();
    $$("#inv-body tr").forEach(tr => {
      const v = tr.getAttribute(attr);
      if (v) vals.add(v);
    });
    return ["(all)", ...Array.from(vals).sort()];
  }
  function populateSelect(sel, values) {
    if (!sel) return;
    sel.innerHTML = "";
    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  }

  // populate options from DOM
  populateSelect(pillarSel, collectDistinct("data-pill"));
  populateSelect(tierSel, collectDistinct("data-tier"));

  // persistence
  const FILTER_KEY = "tgk_admin_filters_v1";
  function saveFilters(){
    const data = {
      q: invSearch?.value || "",
      pillar: pillarSel?.value || "(all)",
      tier: tierSel?.value || "(all)",
      view: gateSel?.value || "free",
    };
    localStorage.setItem(FILTER_KEY, JSON.stringify(data));
  }
  function loadFilters(){
    try {
      const d = JSON.parse(localStorage.getItem(FILTER_KEY) || "{}");
      if (invSearch) invSearch.value = d.q || "";
      if (pillarSel && d.pillar) pillarSel.value = d.pillar;
      if (tierSel && d.tier) tierSel.value = d.tier;
      if (gateSel && d.view) gateSel.value = d.view;
    } catch(e){}
  }
  loadFilters();

  function tierRank(t){ return ({free:0, initiate:1, full:2}[t] ?? 0); }

  function applyInventoryFilters() {
    const q = (invSearch?.value || "").toLowerCase();
    const fPillar = pillarSel?.value || "(all)";
    const fTier = (tierSel?.value || "(all)").toLowerCase();
    const viewAs = (gateSel?.value || "free").toLowerCase();
    const viewRank = tierRank(viewAs);

    $$("#inv-body tr").forEach(tr => {
      const txt = tr.innerText.toLowerCase();
      const p = tr.getAttribute("data-pill") || "";
      const t = (tr.getAttribute("data-tier") || "free").toLowerCase();

      const matchText = !q || txt.includes(q);
      const matchP = fPillar === "(all)" || p === fPillar;
      const matchT = fTier === "(all)" || t === fTier;

      tr.style.display = (matchText && matchP && matchT) ? "" : "none";

      // gating preview: dim rows with higher tier than view
      tr.classList.toggle("dimmed", tierRank(t) > viewRank);
    });
  }

  [invSearch, pillarSel, tierSel, gateSel].forEach(el =>
    el?.addEventListener("input", ()=>{ saveFilters(); applyInventoryFilters(); })
  );
  [pillarSel, tierSel, gateSel].forEach(el =>
    el?.addEventListener("change", ()=>{ saveFilters(); applyInventoryFilters(); })
  );
  applyInventoryFilters();

  /* =========================
     4) Exports
  ========================= */
  function download(name, obj){
    const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"}));
    const a = Object.assign(document.createElement("a"), {href:url, download:name});
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  $("#export-tasks")?.addEventListener("click", ()=> download("tgk-tasks.json", state));
  $("#export-notes")?.addEventListener("click", ()=> download("tgk-taskmeta.json", meta));
  $("#export-all")?.addEventListener("click", ()=>{
    const backup = {
      tasks: state,
      meta,
      filters: JSON.parse(localStorage.getItem(FILTER_KEY)||"{}")
    };
    download("tgk-admin-backup.json", backup);
  });

  /* =========================
     5) Add “View” link next to VS Code
  ========================= */
  $$("#inv-body tr").forEach(tr => {
    const editsCell = tr.querySelector("td:nth-last-child(2)");
    if (!editsCell || editsCell.querySelector(".view-link")) return;
    const url = tr.getAttribute("data-url") || "";
    if (url && url.startsWith("/")) {
      const a = document.createElement("a");
      a.className = "btn small view-link";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "View";
      editsCell.appendChild(document.createTextNode(" "));
      editsCell.appendChild(a);
    }
  });

  /* =========================
     6) Bookmark sync (localStorage stub)
  ========================= */
  const BOOKMARK_KEY = "tgk_bookmarks_v1";
  const bookmarks = new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]"));
  function saveBookmarks() {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(bookmarks)));
  }
  $$(".bookmark-tag").forEach(btn => {
    const id = btn.dataset.bookmarkId;
    if (bookmarks.has(id)) btn.classList.add("bookmarked");
    btn.addEventListener("click", () => {
      if (bookmarks.has(id)) {
        bookmarks.delete(id);
        btn.classList.remove("bookmarked");
      } else {
        bookmarks.add(id);
        btn.classList.add("bookmarked");
      }
      saveBookmarks();
    });
  });

  /* =========================
     7) Safe guard for non-admin pages
  ========================= */
  if (!document.querySelector("#admin-panel")) {
    console.info("TGK Admin: No admin panel detected — accent and inventory features skipped.");
  }

  /* =========================
     8) Event delegation for tag/note buttons (optional enhancement)
  ========================= */
  document.body.addEventListener("click", e => {
    if (e.target.matches(".tag-btn")) {
      const li = e.target.closest(".task");
      const id = li?.dataset.id;
      const curr = (meta[id]?.tags || []).join(", ");
      const val = prompt("Tags (comma separated):", curr);
      if (val === null) return;
      meta[id] = meta[id] || {};
      meta[id].tags = val.split(",").map(s=>s.trim()).filter(Boolean);
      saveMeta(); location.reload();
    }
    if (e.target.matches(".note-btn")) {
      const li = e.target.closest(".task");
      const id = li?.dataset.id;
      const curr = meta[id]?.note || "";
      const val = prompt("Note:", curr);
      if (val === null) return;
      meta[id] = meta[id] || {};
      meta[id].note = val.trim();
      saveMeta(); location.reload();
    }
  });

})();

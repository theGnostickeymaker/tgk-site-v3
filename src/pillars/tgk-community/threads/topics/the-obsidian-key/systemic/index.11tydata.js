// /src/pillars/tgk-community/threads/topics/the-obsidian-key/systemic/index.11tydata.js

export default {
  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-systemic",
  permalink:
    "/pillars/tgk-community/threads/topics/the-obsidian-key/systemic/index.html",

  siteTitle: "The Gnostic Key",
  title: "SYSTEMIC | TGK Community",

  tagline: "Discussion spaces for the SYSTEMIC series.",

  description:
    "Community discussion hubs for SYSTEMIC, tracking rights erosion, enforcement drift, surveillance expansion, protest governance, and the language that manufactures consent across seasons.",

  glyph: "⚖",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    {
      title: "The Obsidian Key",
      url: "/pillars/tgk-community/threads/topics/the-obsidian-key/"
    },
    { title: "SYSTEMIC" }
  ],

  // === SYSTEMIC Gates ===
  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/systemic/discussion/",
      title: "SYSTEMIC (Series Discussion)",
      glyph: "⚖",
      desc:
        "A single thread for cross-season themes: rights erosion by statute and procedure, surveillance normalisation, protest clampdowns, and consent language.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/systemic/season-1/",
      title: "Season I",
      glyph: "⚖",
      desc:
        "Season I gates for Episode I: The Erosion Code, Episode II: Forensic Fictions, and Episode III: Courtroom Alchemy.",
      state: "active",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-house-of-grift",
  permalink:
    "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/index.html",

  siteTitle: "The Gnostic Key",
  title: "House of Grift | TGK Community",

  tagline: "Discussion spaces for the House of Grift investigation.",

  description:
    "Community discussion hubs for House of Grift, tracking royal theatre, dynastic extraction, protected institutions, and the narrative machinery that shields power.",

  glyph: "♛",
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
    { title: "House of Grift" }
  ],

  // === House of Grift Gates ===
  topicGrid: [
    // Series-level thread
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/discussion/",
      title: "House of Grift (Series Discussion)",
      glyph: "♛",
      desc:
        "A single thread for cross-season themes: extraction, immunity, laundering, and the theatre that normalises it.",
      state: "active",
      tier: "free"
    },

    // Season index
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/",
      title: "Season I",
      glyph: "♛",
      desc:
        "Season I gates for Episode I: The British Royals, Episode II: Protected Predator, and Episode III: Princess.",
      state: "active",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

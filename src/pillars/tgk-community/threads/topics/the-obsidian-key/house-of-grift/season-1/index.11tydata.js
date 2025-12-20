export default {
  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-house-of-grift-season-1",
  permalink:
    "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/index.html",

  siteTitle: "The Gnostic Key",
  title: "House of Grift | Season I | TGK Community",

  tagline: "Season I discussion gates for House of Grift.",

  description:
    "Community discussion hubs for House of Grift, Season I, covering royal theatre, dynastic extraction, protected misconduct, and the narrative machinery that shields power from consequence.",

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
    {
      title: "House of Grift",
      url: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/"
    },
    { title: "Season I" }
  ],

  // === Season I Gates ===
  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/discussion/",
      title: "Season I (General Discussion)",
      glyph: "♛",
      desc:
        "A single thread for Season I patterns, connections, and wider reflections on monarchy as theatre and extraction.",
      state: "active",
      tier: "free"
    },
    // === Episode-level discussions ===
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep1-the-british-royals/",
      title: "Episode I: The British Royals",
      glyph: "♛",
      desc:
        "Discussion hub for the monarchy as a protected institution, narrative engine, and extraction system.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep2-the-protected-predator/",
      title: "Episode II: Protected Predator",
      glyph: "⚠",
      desc:
        "Discussion hub examining protection structures, institutional complicity, and power’s immunity rituals.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep3-princess-beatrice/",
      title: "Episode III: Princess Beatrice",
      glyph: "❖",
      desc:
        "Discussion hub for royal womanhood as branding, containment, and public spectacle management.",
      state: "active",
      tier: "free"
    }

  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

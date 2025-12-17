export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-teachings",
  permalink: "/pillars/tgk-community/threads/topics/the-teachings/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Teachings | TGK Community",

  tagline: "Discussion spaces aligned to the Teachings pillar.",

  description:
    "Community discussion hubs for the Teachings pillar, structured to mirror the spiritual curricula and learning arcs of The Gnostic Key.",

  glyph: "✶",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Teachings" }
  ],

  // === Teachings Discussion Gates ===
  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/discussion/",
      title: "The Great Return (Series Discussion)",
      glyph: "☥",
      desc:
        "Cross-series discussion of The Great Return as a whole, including remembrance, death, rebirth, initiation, and the recovery of the soul’s original knowledge.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/",
      title: "The Great Return",
      glyph: "☥",
      desc:
        "Discussion on remembrance, return, death, rebirth, and the recovery of the soul’s original knowledge.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-sovereign-path/",
      title: "The Sovereign Path",
      glyph: "⚖",
      desc:
        "Civic autonomy, rights, self-defence, and practical sovereignty in a managed age.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-childrens-codex/",
      title: "The Children’s Codex",
      glyph: "📜",
      desc:
        "Foundational knowledge, imagination, ethics, and memory work for the next generation.",
      state: "coming-soon",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

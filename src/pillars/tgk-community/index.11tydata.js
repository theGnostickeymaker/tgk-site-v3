export default {
  // ============================================
  // PAGE METADATA (Unified TGK Hierarchy v4.2)
  // ============================================

  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: null,
  seriesTitle: "TGK Community",
  seasonTitle: null,
  episodeTitle: null,
  partTitle: null,

  // Display Title
  title: "TGK Community",

  description:
    "A sovereign space for readers and seekers of The Gnostic Key, built around dialogue, clarity, and good-faith disagreement.",

  excerpt:
    "A living circle where ideas sharpen ideas, steelmanning is culture, and shared inquiry lights the path.",

  // ============================================
  // VISUAL IDENTITY
  // ============================================

  bodyClass: "community",
  accent: "community",

  // ============================================
  // ACCESS
  // ============================================

  tier: "free",
  tags: ["pillar", "tgk-community", "community"],

  // ============================================
  // PILLAR MODULES (ROOT CARDS)
  // ============================================

  communityGrid: [
    {
      href: "/pillars/tgk-community/guide/",
      title: "Community Guide",
      glyph: "✦",
      desc:
        "Charter, participation rules, steelman method, and community ethos.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/threads/",
      title: "Discussion Threads",
      glyph: "💬",
      desc:
        "Topic-based discussions, replies, and the practice of the Steel Man principle.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/court/",
      title: "Community Court",
      glyph: "⚖",
      desc: "Public court logs, precedent, and published rulings. Read-only transparency archive.",
      tier: "free",
      state: "active"
    }
  ],

  // ============================================
  // FLAGS
  // ============================================

  showLens: false,
  showSeriesNav: false
};

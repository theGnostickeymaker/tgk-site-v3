export default {
  // ============================================
  // PAGE METADATA (Unified TGK Hierarchy v4.2)
  // ============================================

  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Guide",
  seriesTitle: "Community Foundations",
  seasonTitle: null,
  episodeTitle: null,
  partTitle: null,

  // Display Title
  title: "Community Guide",

  description:
    "A gateway to the foundational documents, discourse ethics, and participation principles of the TGK Community.",

  excerpt:
    "The Charter, participation rules, steelman method, and moderation philosophy that define TGK’s cultural foundation.",

  // ============================================
  // VISUAL IDENTITY
  // ============================================

  bodyClass: "community",
  accent: "community",

  // ============================================
  // ACCESS
  // ============================================

  tier: "free",
  tags: ["tgk-community", "guide", "foundations"],

  // ============================================
  // GUIDE MODULE GRID
  // ============================================

  guideGrid: [
    {
      href: "/pillars/tgk-community/guide/charter/",
      title: "The Community Charter",
      glyph: "📜",
      desc: "The foundational document outlining the principles and culture of the TGK Community.",
      tier: "default",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/guide/participation-guide/",
      title: "Participation Guide",
      glyph: "👣",
      desc: "How to post, reply, navigate topics, and contribute responsibly.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/guide/steelman-handbook/",
      title: "Steelman Handbook",
      glyph: "⚯",
      desc: "Practical examples and patterns for applying the Steel Man method.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/guide/moderation-philosophy/",
      title: "Moderation Philosophy",
      glyph: "🛡",
      desc: "How TGK moderation protects clarity, dignity, and good-faith discourse.",
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

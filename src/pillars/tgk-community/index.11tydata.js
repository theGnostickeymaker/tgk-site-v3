export default {
  // ============================================
  // PAGE METADATA (Unified TGK Hierarchy v4.2)
  // ============================================

  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: null,
  seriesTitle: null,
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
  // COMMUNITY MODULES (ROADMAP-READY)
  // ============================================

  communityModules: [
    {
      href: "#",
      title: "Discussion Threads",
      glyph: "💬",
      desc:
        "Comment spaces under selected scrolls. A place to read, respond, and practise the Steel Man ethic.",
      tier: "free",
      state: "active"
    },
    {
      href: "#",
      title: "Study Circles",
      glyph: "📚",
      desc:
        "Small-group readings and decodings of TGK texts. Community-led learning in a structured format.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "#",
      title: "Live Sessions",
      glyph: "🎙",
      desc:
        "Talks, Q&A, and real-time gatherings. Rituals, reflections, and knowledge-sharing events.",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // ============================================
  // FLAGS
  // ============================================

  showLens: false,     // Synergist Lens not used here
  showSeriesNav: false // Not a scroll
};

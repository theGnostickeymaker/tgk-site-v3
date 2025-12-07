export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "Topic Threads",

  title: "Discussion Topics",
  description: "Browse all active and upcoming TGK community discussion areas.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  showLens: false,
  showSeriesNav: false,

  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/steel-man-method/",
      title: "The Steel Man Method",
      description: "Master and apply the Steel Man principle.",
      glyph: "∞",
      state: "active",
      minWriteTier: "initiate"
    },
    {
      href: "/pillars/tgk-community/threads/topics/gnostic-christianity/",
      title: "Gnostic Christianity Q&A",
      description: "Interpretation and symbolic analysis of the Gnostic Christianity scroll.",
      glyph: "⚯",
      state: "active",
      minWriteTier: "initiate"
    }
  ]
};

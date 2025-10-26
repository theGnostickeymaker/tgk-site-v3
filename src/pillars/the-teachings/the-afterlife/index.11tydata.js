export default {
  layout: "base.njk",

  // 🜂 Series Collection Overview
  introText:
    "Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond.",

  // 🌍 Pillar & Series Metadata
  pageId: "the-teachings-the-afterlife",
  permalink: "/pillars/the-teachings/the-afterlife/index.html",
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/the-afterlife/",
  pillarGlyph: "✝",
  glyphRow: ["✶", "☥", "✝"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",
  title: "The Afterlife",
  tagline: "Death remembered ✦ soul awakened ✦ eternity revealed",
  description:
    "Sacred teachings from Gnostic, mystical, and ancient traditions — maps for life, death, and beyond.",

  // 🧩 Series Grid
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/",
      title: "The Afterlife — Series 1",
      glyph: "☥",
      tagline: "The false cosmos, Christ the Revealer, and the soul’s return.",
      tier: "initiate-trial",
      state: "active"
    },
    {
      href: "#",
      title: "Series 2",
      glyph: "☥",
      tagline: "Mystical maps of the soul across the East and the Beyond.",
      tier: "adept",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-teachings/the-afterlife.jpg",

  // 🧭 Computed Data
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" }
    ]
  },

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

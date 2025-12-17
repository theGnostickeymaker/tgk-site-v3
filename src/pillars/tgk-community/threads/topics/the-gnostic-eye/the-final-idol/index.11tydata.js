export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-gnostic-eye-final-idol",
  permalink:
    "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Final Idol | TGK Community",

  tagline: "Discussion spaces aligned to The Final Idol series.",

  description:
    "Community discussion hubs for The Final Idol series, exploring AI as idol, prophecy, and power structure through symbolic and Gnostic analysis.",

  glyph: "🜏",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    {
      title: "The Gnostic Eye",
      url: "/pillars/tgk-community/threads/topics/the-gnostic-eye/"
    },
    { title: "The Final Idol" }
  ],

  // === Final Idol Discussion Gates ===
topicGrid: [
  // === Series-level discussions ===
  {
    href:
      "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/series-1/",
    title: "Series I: The Final Idol",
    glyph: "🜏",
    desc:
      "Discussion of Series I as a unified argument exploring the image as god, algorithmic prophecy, and the rise of synthetic faith.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/series-2/",
    title: "Series II: The Final Idol",
    glyph: "⚠️",
    desc:
      "Discussion of Series II, expanding the investigation into control systems, obedience architectures, and the deeper mechanics of machine worship.",
    state: "coming-soon",
    tier: "free"
  }

  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

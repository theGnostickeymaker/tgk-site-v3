export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-great-return-afterlife",
  permalink:
    "/pillars/the-teachings/the-great-return/the-afterlife/index.html",

  // === Hierarchy Titles (used by header) ===
  title: "The Afterlife",

  siteTitle: "The Gnostic Key",
  pillarTitle: "The Teachings",
  gateTitle: "The Great Return",
  seriesTitle: "Series I: The Afterlife",

  tagline: "Through death’s veil, the soul remembers and the light returns",
  description:
    "The opening season of The Great Return. A journey through the world’s afterlife traditions, mapping death, rebirth, judgement, transformation, and the soul’s return to its origin.",

  // === Structural Metadata ===
  pillarId: "the-teachings",
  pillarUrl: "/pillars/the-teachings/",

  seriesId: "the-great-return",
  seriesUrl: "/pillars/the-teachings/the-great-return/",

  glyph: "☥",
  glyphRow: ["✶", "☥", "✶"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Season Grid (Season-level navigation) ===
  pillarGrid: [
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/",
      title: "Season I: Maps of the Afterlife",
      glyph: "☥",
      desc:
        "Six-episode exploration of the world’s afterlife traditions, each revealing a distinct map of death, rebirth, and return.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-2/",
      title: "Season II: Maps of the Afterlife",
      glyph: "☥",
      desc:
        "Six further gateways into the hidden passages of the soul, expanding the architecture of remembrance and return.",
      state: "coming-soon",
      tier: "adept"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-teachings/the-great-return/the-afterlife/the-afterlife-index.jpg",

  // === Breadcrumbs ===
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Great Return", url: "/pillars/the-teachings/the-great-return/" },
      {
        title: "The Afterlife",
        url:
          "/pillars/the-teachings/the-great-return/the-afterlife/"
      }
    ]
  },

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};
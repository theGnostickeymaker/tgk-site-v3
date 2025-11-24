export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-great-return-afterlife",
  permalink:
    "/pillars/the-teachings/the-great-return/the-afterlife/index.html",

  title: "The Afterlife",
  tagline: "Through death’s veil ✦ the soul remembers ✦ the light returns",
  description:
    "A multi-season journey through the world’s afterlife traditions, exploring the passages of death, rebirth, judgement, transformation, and the mysteries of return.",

  // === Hierarchy Metadata ===
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/",

  seriesId: "the-great-return",
  seriesName: "The Great Return",
  seriesUrl: "/pillars/the-teachings/the-great-return/",

  glyph: "☥",
  glyphRow: ["✶", "☥", "✶"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Season Grid (Season-level navigation)  ===
pillarGrid: [
  {
    href:
      "/pillars/the-teachings/the-great-return/the-afterlife/season-1/",
    title: "Season I: The Afterlife Scrolls",
    glyph: "☥",
    desc:
      "Six-episode exploration of the world’s afterlife traditions.",
    state: "active",
    tier: "initiate-trial"
  },
  {
    href:
      "/pillars/the-teachings/the-great-return/the-afterlife/season-2/",
    title: "Season II: The Afterlife Scrolls",
    glyph: "☥",
    desc:
      "Six further gateways into the hidden maps of death and return.",
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

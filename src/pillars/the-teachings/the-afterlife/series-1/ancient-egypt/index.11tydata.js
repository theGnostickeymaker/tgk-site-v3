export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["𓂀", "☥", "𓂀"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/",
  pillarHome: "/pillars/the-teachings/",
  tagline: "Three-part journey through the false cosmos and the Revealer.",
  layout: "base.njk",

  // 🔹 Series Hierarchy
  pillar: "the-teachings",
  series: "the-afterlife",
  episode: 5,
  seriesMeta: {
    number: 1,
    label: "Series 1",
    series_version: 1
  },

  // 🜂 Episode Overview
  introText: "— a three-part journey through the false cosmos, the Revealer, and the soul’s return.",
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText:
    "<p>Interpretations vary across Gnostic schools and manuscripts within this pillar and series.</p>",

// 🔹 Episode Parts (for dynamic part navigation)
episodeParts: [
  {
    title: "Part I — The Eternal Nile: Death Is Not the End",
    desc: "The rites of preservation and the secrets of Ma’at — from mummification to the soul’s first awakening.",
    url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-1/"
  },
  {
    title: "Part II — The Twelve Gates: Trials of the Duat",
    desc: "The journey through the Duat — twelve gates, spells of becoming, and the testing of the soul’s true name.",
    url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-2/"
  },
  {
    title: "Part III — The Resurrection of Light: The Weighing of the Heart",
    desc: "The weighing of the heart, the birth of the Akh, and the soul’s ascension among the Imperishables.",
    url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-3/"
  }
],

  // 🔹 Series Navigation (cross-episode buttons)
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos, Christ the Revealer, and the soul’s return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/"
    },
    {
      title: "Sufi Islam",
      desc: "The seeker’s path through love, annihilation, and return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/"
    }
  ,
    {
      title: "Kabbalah",
      desc: "The path of Kabbalah within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/"
    }
  ,
    {
      title: "Buddhism",
      desc: "The path of Buddhism within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/"
    }
  ,
    {
      title: "Ancient Egypt",
      desc: "The path of Ancient Egypt within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/"
    }
  ],

// 🧭 Scroll Grid Cards (episode landing page)
pillarGrid: [
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-1/",
    title: "Part I — The Eternal Nile: Death Is Not the End",
    glyph: "𓂀",
    tagline: "The rites of preservation ✦ the Ka and Ba ✦ mummification as resurrection technology.",
    tier: "initiate",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-2/",
    title: "Part II — The Twelve Gates: Trials of the Duat",
    glyph: "𓂀",
    tagline: "The solar barque ✦ the gatekeepers of memory ✦ spells, names, and the soul’s passage through night.",
    tier: "initiate",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/part-3/",
    title: "Part III — The Resurrection of Light: The Weighing of the Heart",
    glyph: "𓂀",
    tagline: "The scales of Ma’at ✦ the confession of truth ✦ the Akh reborn among the stars.",
    tier: "initiate",
    state: "active"
  }
],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "/media/the-teachings/the-afterlife/series-1/ancient-egypt",
    imgPrefix: (data) => data.imgPrefix || "ancient-egypt-",
    socialImage: (data) => data.socialImage || "/tgk-assets/images/share/the-teachings/the-afterlife/ancient-egypt.jpg",
    breadcrumbsBase: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" }
    ],
    breadcrumbs: (data) =>
      [...(data.breadcrumbsBase || []), data.title ? { title: data.title } : null].filter(Boolean)
  }
};

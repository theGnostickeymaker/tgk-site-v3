export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["✝", "☥", "✝"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/",
  pillarHome: "/pillars/the-teachings/",
  tagline: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
  layout: "base.njk",

  // 🔹 Series Hierarchy
  pillar: "the-teachings",
  series: "the-afterlife",
  episode: 1,
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
      title: "Part I",
      desc: "The false cosmos, Sophia’s fall, and the hidden map of return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/"
    },
    {
      title: "Part II",
      desc: "The hidden Christ awakens the divine spark within the soul.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/"
    },
    {
      title: "Part III",
      desc: "Through the toll gates of death, the awakened soul remembers its home.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/"
    }
  ],

  // 🔹 Series Navigation (cross-episode buttons)
    seriesNav: [
    { title: "Gnostic Christianity", desc: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" },
    { title: "Sufi Islam", desc: "Three-part journey through the false cosmos and the Revealer.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/" }
  ],

  // 🧭 Scroll Grid Cards (episode landing page)
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/",
      title: "Part I — The World Is Not What It Seems",
      glyph: "✝",
      tagline: "The hidden God ✦ Sophia’s fall ✦ the Demiurge ✦ the spark within.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/",
      title: "Part II — The Revealer and the Spark",
      glyph: "✝",
      tagline: "From the false god to the forgotten light ✦ the Christ of Gnosis.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
      title: "Part III — The Soul’s Return",
      glyph: "✝",
      tagline: "The toll gates of the Archons ✦ the deathless spark ✦ the memory that frees the soul.",
      tier: "free",
      state: "default"
    }
  ],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) =>
      data.imgBase || "/media/the-teachings/the-afterlife/series-1/gnostic-christianity",
    imgPrefix: (data) => data.imgPrefix || "gnostic-christianity-",
    socialImage: (data) =>
      data.socialImage ||
      "/tgk-assets/images/share/the-teachings/the-afterlife/gnostic-christianity.jpg",

    // 🔹 Breadcrumb generation
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


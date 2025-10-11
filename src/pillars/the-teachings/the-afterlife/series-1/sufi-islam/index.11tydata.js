export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["☪", "☥", "☪"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/",
  pillarHome: "/pillars/the-teachings/",
  tagline: "Three-part journey through the false cosmos and the Revealer.",
  layout: "base.njk",

  // 🔹 Series Hierarchy
  pillar: "the-teachings",
  series: "the-afterlife",
  episode: 2,
  seriesMeta: {
    number: 1,
    label: "Series 1",
    series_version: 1
  },

  // 🜂 Episode Overview
  introText: "— a three-part journey through the false cosmos, the Revealer, and the soul’s return.",
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText:
    "<p>Interpretations vary across mystical schools and manuscripts within this pillar and series.</p>",

  // 🔹 Episode Parts (for dynamic part navigation)
  episodeParts: [
    { title: "Part I", desc: "The false world and the seeker’s first awakening.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-1/" },
    { title: "Part II", desc: "The unveiling of divine remembrance through devotion.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-2/" },
    { title: "Part III", desc: "The soul’s reunion with the Beloved — union beyond self.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-3/" }
  ],

  // 🔹 Series Navigation (cross-episode buttons)
    seriesNav: [
    { title: "Gnostic Christianity", desc: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" },
    { title: "Sufi Islam", desc: "Three-part journey through the false cosmos and the Revealer.", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/" }
  ],

  // 🧭 Scroll Grid Cards (episode landing page)
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-1/",
      title: "Part I — TBD",
      glyph: "☪",
      tagline: "TBD",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-2/",
      title: "Part II — TBD",
      glyph: "☪",
      tagline: "TBD",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-3/",
      title: "Part III — TBD",
      glyph: "☪",
      tagline: "TBD",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "/media/the-teachings/the-afterlife/series-1/sufi-islam",
    imgPrefix: (data) => data.imgPrefix || "sufi-islam-",
    socialImage: (data) => data.socialImage || "/tgk-assets/images/share/the-teachings/the-afterlife/sufi-islam.jpg",
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

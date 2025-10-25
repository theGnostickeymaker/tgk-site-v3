export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["☪", "☥", "☪"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/",
  pillarHome: "/pillars/the-teachings/",
  tagline: "Three-part journey through the false cosmos and the Revealer.",
  layout: "base.njk",
  tier: "free", 
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
    "<p>Interpretations vary across Gnostic schools and manuscripts within this pillar and series.</p>",
// 🔹 Episode Parts (for dynamic part navigation)
episodeParts: [
  {
    title: "Part I — The Veil Between Worlds",
    desc: "Barzakh, purification, and the mirror realm where the soul meets its own light and shadow.",
    url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-1/"
  },
  {
    title: "Part II — The Ascent & the Beloved",
    desc: "Longing, remembrance, and the spiral dance of union with the Divine.",
    url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-2/"
  },
  {
    title: "Part III — Fanā’ and the Eternal Dance",
    desc: "Annihilation, abiding, and the soul’s return into the endless unfolding of Love.",
    url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-3/"
  }
],

  // 🧭 Cross-Episode Navigation (series map)
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
  ,
    {
      title: "Mesoamerica",
      desc: "The path of Mesoamerica within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/mesoamerica/"
    }
  ],


// 🧭 Scroll Grid Cards (episode landing page)
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-1/",
      title: "Part I — The Veil Between Worlds",
      glyph: "☪",
      tagline: "The Hidden Architecture of Illusion & the Divine Spark in Exile.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-2/",
      title: "Part II — The Ascent & The Beloved",
      glyph: "☪",
      tagline: "Longing, Remembrance, and the Spiral Dance of Union.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-3/",
      title: "Part III — fanā&lsquo; & The Eternal Dance",
      glyph: "☪",
      tagline: "Annihilation, Abiding, and the Final Unveiling.",
      tier: "free",
      state: "default"
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







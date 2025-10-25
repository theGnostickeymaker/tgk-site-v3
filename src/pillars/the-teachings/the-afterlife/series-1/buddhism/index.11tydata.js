export default {
  // 📖 Series + Pillar Metadata
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["☸", "☥", "☸"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/buddhism/",
  pillarHome: "/pillars/the-teachings/",
  tagline: "Three-part journey through the false cosmos and the Revealer.",
  layout: "base.njk",
  tier: "free", 

  // 🔹 Series Hierarchy
  pillar: "the-teachings",
  series: "the-afterlife",
  episode: 4,
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
    title: "Part I — Roots & Cosmology",
    desc: "The Wheel of Life, the Six Realms, and the cosmology of becoming.",
    url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-1/"
  },
  {
    title: "Part II — The Path of Compassion",
    desc: "The Bodhisattva vow, the awakened heart, and the six perfections.",
    url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-2/"
  },
  {
    title: "Part III — The Diamond Path",
    desc: "Through the bardos, the clear light, and the gates of liberation beyond rebirth.",
    url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-3/"
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
    href: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-1/",
    title: "Part I — Roots & Cosmology",
    glyph: "☸",
    tagline: "The Wheel of Life ✦ The Six Realms ✦ The cosmic architecture of becoming.",
    tier: "initiate",
    state: "default"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-2/",
    title: "Part II — The Path of Compassion",
    glyph: "☸",
    tagline: "The Bodhisattva vow ✦ The awakened heart ✦ The six perfections of virtue.",
    tier: "initiate",
    state: "default"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-3/",
    title: "Part III — The Diamond Path",
    glyph: "☸",
    tagline: "The bardos ✦ The clear light ✦ Liberation beyond rebirth.",
    tier: "initiate",
    state: "default"
  }
],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "/media/the-teachings/the-afterlife/series-1/buddhism",
    imgPrefix: (data) => data.imgPrefix || "buddhism-",
    socialImage: (data) => data.socialImage || "/tgk-assets/images/share/the-teachings/the-afterlife/buddhism.jpg",
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




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

  // 🔹 Series Nav (for episode-level overview)
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos, Christ the Revealer, and the soul’s return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/"
    }
  ],

  // 🧭 Computed properties for flexible page rendering
  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) =>
      data.imgBase ||
      "/media/the-teachings/the-afterlife/series-1/gnostic-christianity",
    imgPrefix: (data) => data.imgPrefix || "gnostic-christianity-",
    socialImage: (data) =>
      data.socialImage ||
      "/tgk-assets/images/share/the-teachings/the-afterlife/gnostic-christianity.jpg",

    // 🔹 Breadcrumb generation (auto-extends with current title)
    breadcrumbsBase: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series I", url: "/pillars/the-teachings/the-afterlife/series-1/" }
    ],
    breadcrumbs: (data) =>
      [...(data.breadcrumbsBase || []), data.title ? { title: data.title } : null].filter(Boolean)
  }
};

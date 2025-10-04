export default {
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["✝", "☥", "✝"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/",
  pillarHome: "/pillars/the-teachings/",
  episode: 1,
  tagline: "The false cosmos, Christ the Revealer, and the soul’s return.",
  seriesMeta: { number: 1, label: "Series 1", series_version: 1 },
  episodeParts: [
    { title: "Part I", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/" },
    { title: "Part II", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/" },
    { title: "Part III", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/" }
  ],
  seriesNav: [
    { title: "Gnostic Christianity", desc: "The false cosmos, Christ the Revealer, and the soul’s return.", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" },
  ],
  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  eleventyComputed: {
    slug: (d) => d.slug || d.page.fileSlug,
    permalink: (d) => d.permalink || d.page.url,
    imgBase: (d) => d.imgBase || "/media/the-teachings/the-afterlife/series-1/gnostic-christianity",
    imgPrefix: (d) => d.imgPrefix || "gnostic-christianity-",
    socialImage: (d) => d.socialImage || "/tgk-assets/images/share/the-teachings/the-afterlife/gnostic-christianity.jpg",
    breadcrumbsBase: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" }
    ],
    breadcrumbs: (d) => [...(d.breadcrumbsBase || []), d.title ? { title: d.title } : null].filter(Boolean)
  }
};

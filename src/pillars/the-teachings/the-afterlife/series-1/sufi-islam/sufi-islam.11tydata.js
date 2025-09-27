export default {
  seriesLabel: "The Afterlife Series",
  pillarLabel: "the-teachings",
  glyphRow: ["☪","𓂀","☪"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/",
  pillarHome: "/pillars/the-teachings/",
  episode: 2,
  tagline: "Three-part journey: the false cosmos, Christ the Revealer, and the soul’s return.",
  seriesMeta: { number: 1, label: "Series 1", series_version: 1 },
  episodeParts: [
    { title: "Part I — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-1/" },
    { title: "Part II — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-2/" },
    { title: "Part III — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/part-3/" }
  ],
  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  eleventyComputed: {
    slug: (d) => d.slug || d.page.fileSlug,
    permalink: (d) => d.permalink || d.page.url,
    imgBase: (d) => d.imgBase || "/media/the-teachings/the-afterlife/series-1/sufi-islam",
    imgPrefix: (d) => d.imgPrefix || "sufi-islam-",
    socialImage: (d) => d.socialImage || "/tgk-assets/images/share/the-teachings/the-afterlife/sufi-islam.jpg",
    breadcrumbsBase: (d) => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" },
   ],
    breadcrumbs: (d) => [ ...(d.breadcrumbsBase || []), d.title ? { title: d.title } : null ].filter(Boolean)
  }
};
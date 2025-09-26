export default {
  seriesLabel: "The Afterlife Series",
  pillarLabel: "the-teachings",
  glyphRow: ["⛪︎","𓂀","⛪︎"],
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/",
  pillarHome: "/pillars/the-teachings/",
  episode: 1,
  tagline: "Gnostic christianity, Episode 1 tagline",
  seriesMeta: { number: 1, label: "Series 1", series_version: 1 },
  episodeParts: [
    { title: "Part I — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/" },
    { title: "Part II — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/" },
    { title: "Part III — TBD", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/" }
  ],
  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  eleventyComputed: {
    slug: (d) => d.slug || d.page.fileSlug,
    permalink: (d) => d.permalink || d.page.url,
    imgBase: (d) => d.imgBase || "/media/the-teachings/the-afterlife/series-1/gnostic-christianity",
    imgPrefix: (d) => d.imgPrefix || "gnostic-christianity-",
    socialImage: (d) => d.socialImage || "/pillars/the-teachings/the-afterlife/og/gnostic-christianity.jpg",
    breadcrumbsBase: (d) => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" },
      { title: "Gnostic christianity", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" }
    ],
    breadcrumbs: (d) => [ ...(d.breadcrumbsBase || []), d.title ? { title: d.title } : null ].filter(Boolean)
  }
};
export default {
  seriesLabel: "Afterlife Series",
  pillarLabel: "The Teachings",
  glyphRow: ["⛪︎","ð“‚€","⛪︎"],

  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/",
  pillarHome: "/pillars/the-teachings/",

  episodeParts: [
    { title: "Part I", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/" },
    { title: "Part II", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/" },
    { title: "Part III", desc: "", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/" }
  ],

  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  seriesMeta: { number: 1, label: "Series 1", series_version: 1 },

  eleventyComputed: {
    slug: (data) => data.slug || data.page.fileSlug,
    permalink: (data) => data.permalink || data.page.url,
    imgBase: (data) => data.imgBase || "/media/afterlife/series-1/gnostic-christianity",
    imgPrefix: (data) => data.imgPrefix || "gnostic-christianity-",
    socialImage: (data) => data.socialImage || "/pillars/the-teachings/the-afterlife/og/gnostic-christianity.jpg",
    breadcrumbsBase: (data) => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
      { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" },
      { title: "Gnostic Christianity", url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/" }
    ],
    breadcrumbs: (data) => [
      ...(data.breadcrumbsBase || []),
      data.title ? { title: data.title } : null
    ].filter(Boolean)
  }
}
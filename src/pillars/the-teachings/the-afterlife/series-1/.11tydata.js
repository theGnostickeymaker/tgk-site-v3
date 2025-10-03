export default {
  layout: "base.njk",
  pillar: "the-teachings",
  series: "the-afterlife",
  seriesMeta: { number: 1, label: "Series 1", series_version: 1 },
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
    { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" }
  ]
};

module.exports = {
  eleventyComputed: {
    crossLinks: data => data.crossLinks || [],
    vaultRefs: data => data.vaultRefs || [],
    communityThreads: data => data.communityThreads || [],
    relatedProducts: data => data.relatedProducts || [],
    nodeId: data => `${data.pillar || ''}:${data.series || ''}:${data.slug || data.page.fileSlug}`
  }
};

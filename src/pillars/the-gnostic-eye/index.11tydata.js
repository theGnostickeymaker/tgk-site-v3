export default {
  series: "final-idol",
  seriesTitle: "The Final Idol",

  eleventyComputed: {
    header: (data) => ({
      ...(data.header || {}),
      series: "final-idol",
      seriesTitle: "The Final Idol"
    }),

    pillarId: () => "the-gnostic-eye",
    pillarName: () => "The Gnostic Eye",
    pillarUrl: () => "/pillars/the-gnostic-eye/",
    pillarGlyphs: () => "👁️",
    accent: () => "slate",

    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Gnostic Eye", url: "/pillars/the-gnostic-eye/" },
      { title: "The Final Idol", url: "/pillars/the-gnostic-eye/final-idol/" }
    ]
  }
};

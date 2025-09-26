export default {
  eleventyComputed: {
    pillarId: () => "the-gnostic-eye",
    pillarName: () => "The Gnostic Eye",
    pillarUrl: () => "/pillars/the-gnostic-eye/",
    pillarGlyph: () => "☿",
    accent: () => "eye",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Gnostic Eye", url: "/pillars/the-gnostic-eye/" }
    ])
  }
};

export default {
  eleventyComputed: {
    pillarId: () => "the-teachings",
    pillarName: () => "The Teachings",
    pillarUrl: () => "/pillars/the-teachings/",
    pillarGlyph: () => "✶",
    accent: () => "lightgold",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" }
    ])
  }
};

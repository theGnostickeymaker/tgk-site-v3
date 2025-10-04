export default {
  eleventyComputed: {
    pillarId: () => "the-teachings",
    pillarName: () => "The Teachings",
    pillarUrl: () => "/pillars/the-teachings/",
    pillarGlyph: () => "⛪︎",
    accent: () => "gold",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" }
    ])
  }
};

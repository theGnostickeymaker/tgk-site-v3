export default {
  eleventyComputed: {
    pillarId: () => "the-teachings",
    pillarName: () => "The Teachings",
    pillarUrl: () => "/pillars/the-teachings/the-afterlife/",
    pillarGlyph: () => "⛪︎",
    accent: () => "gold",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" },
      { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" }
    ])
  }
};
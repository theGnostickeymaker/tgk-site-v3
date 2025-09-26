export default {
  eleventyComputed: {
    pillarId: () => "the-resonant-key",
    pillarName: () => "The Resonant Key",
    pillarUrl: () => "/pillars/the-resonant-key/",
    pillarGlyph: () => "🎵",
    accent: () => "resonant",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Resonant Key", url: "/pillars/the-resonant-key/" }
    ])
  }
};

export default {
  eleventyComputed: {
    pillarId: () => "the-obsidian-key",
    pillarName: () => "The Obsidian Key",
    pillarUrl: () => "/pillars/the-obsidian-key/",
    pillarGlyph: () => "🜂",
    accent: () => "obsidian",
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Obsidian Key", url: "/pillars/the-obsidian-key/" }
    ])
  }
};

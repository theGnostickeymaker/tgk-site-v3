export default {
  eleventyComputed: {
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    pillarGlyph: () => "🗄️",
    accent: () => "vault",
    tags: () => ["pillar", "the-vault"],
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" }
    ])
  }
};

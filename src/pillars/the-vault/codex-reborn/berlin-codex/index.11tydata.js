export default {
  eleventyComputed: {
    // === Context ===
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Berlin Codex",
    pillarGlyph: () => "💮",
    accent: () => "vault",
    glyphRow: () => ["💮", "🕯", "💮"],

    // === Breadcrumbs ===
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Berlin Codex", url: "/pillars/the-vault/codex-reborn/berlin-codex/" }
    ]),

    // === Section Cards (Berlin Codex Texts) ===
    pillarGrid: () => ([
      {
        title: "Gospel of Mary Magdalene",
        desc: "A dialogue between the risen Christ and Mary revealing the soul’s ascent through the powers.",
        href: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
        glyph: "🌸",
        tier: "initiate",
        state: "default"
      },
      {
        title: "Apocryphon of John (fragment)",
        desc: "A shorter version of the same revelation text, preserved here as an alternate copy.",
        href: "/pillars/the-vault/codex-reborn/berlin-codex/apocryphon-of-john-fragment/",
        glyph: "📜",
        tier: "full",
        state: "coming-soon"
      }
    ])
  }
};

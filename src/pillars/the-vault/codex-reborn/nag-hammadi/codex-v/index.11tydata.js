export default {
  eleventyComputed: {
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Nag Hammadi – Codex V",
    pillarGlyph: () => "📜",
    accent: () => "vault",
    glyphRow: () => ["📜", "🕯", "📜"],

    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
      { title: "Codex V", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/" }
    ]),

    // === Codex V: Primary texts
    pillarGrid: () => ([
      {
        title: "Apocalypse of Paul",
        desc: "Paul’s visionary ascent through the heavens — toll gates, interrogators, and the soul’s liberation through the secret sign.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-paul/",
        glyph: "🜂",
        tier: "initiate",
        state: "default"
      },
      {
        title: "First Apocalypse of James",
        desc: "A revelation of the risen Christ to James — teaching fearlessness before the archons and the mystery of redemption.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/first-apocalypse-of-james/",
        glyph: "🕯",
        tier: "initiate",
        state: "default"
      },
      {
        title: "Second Apocalypse of James",
        desc: "James receives hidden instructions for the soul’s ascent beyond the rulers of the world — the secret passwords of deliverance.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/second-apocalypse-of-james/",
        glyph: "📜",
        tier: "adept",
        state: "default"
      },
      {
        title: "Apocalypse of Adam",
        desc: "The primeval testament of Adam — a revelation of the coming flood and the knowledge of the true Light.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-adam/",
        glyph: "💧",
        tier: "adept",
        state: "default"
      },
      {
        title: "Fragment on the Origin of the World (Codex V Variant)",
        desc: "A fragmentary retelling of the cosmic myth paralleling Codex II — differing in tone and theological nuance.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/origin-fragment/",
        glyph: "🜁",
        tier: "initiate",
        state: "coming-soon"
      }
    ])
  }
};

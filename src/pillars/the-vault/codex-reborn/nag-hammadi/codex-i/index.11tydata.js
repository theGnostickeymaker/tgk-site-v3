export default {
  eleventyComputed: {
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Nag Hammadi – Codex I",
    pillarGlyph: () => "📜",
    accent: () => "vault",
    glyphRow: () => ["📜", "🕯", "📜"],

    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
      { title: "Codex I", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/" }
    ]),

    // === Texts within Codex I
    pillarGrid: () => ([
      {
        title: "Gospel of Truth",
        desc: "A poetic meditation attributed to Valentinus — the good news of self-knowledge and the return to the Father.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/gospel-of-truth/",
        glyph: "📜",
        tier: "free",
        state: "default"
      },
      {
        title: "Tripartite Tractate",
        desc: "A grand cosmological narrative describing emanation, fall, and restoration within the divine Fullness.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/tripartite-tractate/",
        glyph: "🕯",
        tier: "initiate",
        state: "coming-soon"
      },
      {
        title: "Treatise on the Resurrection",
        desc: "A letter on spiritual rebirth and the awakening of the inner man, attributed to Rheginos.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/treatise-on-the-resurrection/",
        glyph: "🜂",
        tier: "initiate",
        state: "coming-soon"
      }
    ])
  }
};

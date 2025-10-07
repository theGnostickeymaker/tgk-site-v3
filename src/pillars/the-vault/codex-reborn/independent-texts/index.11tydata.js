// src/pillars/the-vault/codex-reborn/nag-hammadi/index.11tydata.js
export default {
  eleventyComputed: {
    // === Context ===
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Nag Hammadi Library",
    pillarGlyph: () => "📜",
    accent: () => "vault",
    glyphRow: () => ["📜", "🕯", "📜"],

    // === Breadcrumb Trail ===
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" }
    ]),

    // === Codex Grid (I–XIII)
    pillarGrid: () => ([
      {
        title: "Codex I",
        desc: "Containing the Gospel of Truth, the Tripartite Tractate, and related treatises of Light and emanation.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Codex II",
        desc: "Home of the Apocryphon of John, the Gospel of Thomas, and the Gospel of Philip — foundational Gnostic revelations.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Codex V",
        desc: "Including the Apocalypse of Paul and other visionary texts describing the soul’s ascent.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Codex VII",
        desc: "Containing the Second Treatise of the Great Seth — laughter of the true Light over the false powers.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Other Codices (III–XIII)",
        desc: "Additional tractates including the Acts of Peter and the Twelve Apostles, and On the Origin of the World.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/other-codices/",
        glyph: "📜",
        tier: "initiate",
        state: "coming-soon"
      }
    ])
  }
};

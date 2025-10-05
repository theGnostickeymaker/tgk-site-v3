export default {
  eleventyComputed: {
    // === Pillar Context ===
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    pillarGlyph: () => "⛪︎",
    accent: () => "vault",
    glyphRow: () => ["🜂", "🕯", "🜂"],

    // === Breadcrumbs ===
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" }
    ]),

    // === Updated Card Grid (Top-Level Vault Categories) ===
    pillarGrid: () => ([
      {
        title: "Codex Reborn",
        desc: "Recovered Gnostic gospels and apocrypha — the hidden voice of Christ and Sophia.",
        href: "/pillars/the-vault/codex-reborn/",
        glyph: "📜",
        tier: "free",
        state: "default"
      },
      {
        title: "House of Grift Documents",
        desc: "Declassified royal and elite correspondence — original source files from the House of Grift investigations.",
        href: "/pillars/the-vault/house-of-grift-documents/",
        glyph: "👑",
        tier: "initiate",
        state: "coming-soon"
      },
      {
        title: "SYSTEMIC Archives",
        desc: "Legislative evidence, court transcripts, and rights-erosion case files supporting the SYSTEMIC series.",
        href: "/pillars/the-vault/systemic-documents/",
        glyph: "⚖️",
        tier: "initiate",
        state: "coming-soon"
      },
      {
        title: "Forbidden Documents",
        desc: "Erased histories, banned books, and censored knowledge preserved for study and remembrance.",
        href: "/pillars/the-vault/forbidden-documents/",
        glyph: "🚫",
        tier: "free",
        state: "default"
      }
    ])
  }
};

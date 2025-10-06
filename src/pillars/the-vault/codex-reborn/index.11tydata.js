export default {
  eleventyComputed: {
    // === Pillar Context ===
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Codex Reborn",
    pillarGlyph: () => "📜",
    accent: () => "vault",
    glyphRow: () => ["🜂", "🕯", "🜂"],

    // === Breadcrumb Trail ===
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" }
    ]),

    // === Library Collections (Codex Reborn Sub-libraries)
    pillarGrid: () => ([
      {
        title: "Nag Hammadi Library",
        desc: "Thirteen ancient codices discovered in 1945 — the hidden gospels of Sophia and the Light.",
        href: "/pillars/the-vault/codex-reborn/nag-hammadi/",
        glyph: "📜",
        tier: "free",
        state: "default"
      },
      {
        title: "Berlin Codex",
        desc: "Preserving the Gospel of Mary and other texts once erased by orthodoxy.",
        href: "/pillars/the-vault/codex-reborn/berlin-codex/",
        glyph: "💮",
        tier: "initiate",
        state: "default"
      },
      {
        title: "Codex Tchacos",
        desc: "Modern discovery including the controversial Gospel of Judas — revelation through betrayal.",
        href: "/pillars/the-vault/codex-reborn/codex-tchacos/",
        glyph: "☥",
        tier: "initiate",
        state: "coming-soon"
      },
      {
        title: "Biblical & Apocryphal Texts",
        desc: "Canonical and extra-canonical scriptures reinterpreted through the Gnostic lens.",
        href: "/pillars/the-vault/codex-reborn/biblical-apocrypha/",
        glyph: "🌿",
        tier: "free",
        state: "coming-soon"
      },
      {
        title: "Independent Texts",
        desc: "Major Gnostic treatises such as the Pistis Sophia — vast revelations of Light and descent.",
        href: "/pillars/the-vault/codex-reborn/independent-texts/",
        glyph: "🕊",
        tier: "full",
        state: "coming-soon"
      }
    ])
  }
};

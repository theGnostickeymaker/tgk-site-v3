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

    // === Section Cards (Layer below The Vault) ===
    pillarGrid: () => ([
      {
        title: "Gnostic Texts",
        desc: "Recovered revelations from Nag Hammadi — the secret gospels of Christ and Sophia.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Mystical Traditions",
        desc: "Hidden writings from Kabbalah, Sufism, Buddhism, Egypt, and beyond.",
        href: "/pillars/the-vault/codex-reborn/mystical-traditions/",
        glyph: "✡️",
        tier: "free",
        state: "coming-soon"
      },
      {
        title: "Forbidden Documents",
        desc: "Erased histories, banned manuscripts, and censored revelations preserved in the Vault.",
        href: "/pillars/the-vault/codex-reborn/forbidden-documents/",
        glyph: "🚫",
        tier: "free",
        state: "coming-soon"
      }
    ])
  }
};

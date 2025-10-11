export default {
  layout: "base.njk",
  pillar: "the-vault",
  title: "The Vault",
  description: "Preserving erased, sacred, and forbidden texts — the memory of what was meant to be lost.",
  glyph: "🗄️",
  bodyClass: "vault",

  // === Accent and Tagging ===
  accent: "vault",
  tags: ["pillar", "the-vault"],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" }
  ],

  // === Glyph Row for Header ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Vault Category Grid ===
  pillarGrid: [
    {
      title: "Codex Reborn",
      desc: "Recovered Gnostic gospels and apocrypha — the hidden voice of Christ and Sophia.",
      href: "/pillars/the-vault/codex-reborn/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Mystical Traditions Archive",
      desc: "Sufi, Buddhist, Kabbalistic, and Egyptian spiritual writings.",
      href: "/pillars/the-vault/mystical-traditions/",
      glyph: "🕉️",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Forbidden Documents",
      desc: "Erased histories, banned books, and censored knowledge preserved for study and remembrance.",
      href: "/pillars/the-vault/forbidden-documents/",
      glyph: "🚫",
      tier: "initiate",
      state: "coming-soon"
    }
  ]
};

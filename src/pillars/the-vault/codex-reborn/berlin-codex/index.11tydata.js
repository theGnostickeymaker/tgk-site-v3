export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "berlin-codex",
  title: "Berlin Codex",
  description: "Preserving the Gospel of Mary and other Gnostic texts once erased by orthodoxy.",
  glyph: "💮",
  bodyClass: "vault",
  tier: "free", 

  // === Accent & Tagging ===
  accent: "vault",
  tags: ["pillar", "the-vault", "codex-reborn", "berlin-codex"],

  // === Section Cards (Berlin Codex Texts) ===
  pillarGrid: [
    {
      title: "Gospel of Mary Magdalene",
      desc: "A dialogue between the risen Christ and Mary revealing the soul’s ascent through the powers.",
      href: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
      glyph: "🌸",
      tier: "free",
      state: "default"
    },
    {
      title: "Apocryphon of John (fragment)",
      desc: "A shorter version of the same revelation text, preserved here as an alternate copy.",
      href: "/pillars/the-vault/codex-reborn/berlin-codex/apocryphon-of-john-fragment/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ]
};

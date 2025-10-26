export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-berlin-codex",
  permalink: "/pillars/the-vault/codex-reborn/berlin-codex/index.html",
  pillarId: "the-vault",
  seriesId: "codex-reborn",
  title: "Berlin Codex",
  description:
    "Recovered Gnostic texts from the Berlin Codex — preserved fragments of Sophia’s light.",
  tagline: "Hidden pages ✦ restored wisdom ✦ the memory of the soul",
  glyph: "💮",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",
  tags: ["pillar", "the-vault", "codex-reborn", "berlin-codex"],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Berlin Codex", url: "/pillars/the-vault/codex-reborn/berlin-codex/" }
  ],

  // === Section Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/text/",
      title: "Gospel of Mary Magdalene",
      desc: "A dialogue between the risen Christ and Mary revealing the soul’s ascent through the powers.",
      glyph: "🌸",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/apocryphon-of-john-fragment/text/",
      title: "Apocryphon of John (fragment)",
      desc: "A shorter version of the same revelation text, preserved here as an alternate copy.",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/berlin-codex.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

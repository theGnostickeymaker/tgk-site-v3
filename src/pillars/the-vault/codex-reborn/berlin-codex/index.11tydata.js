// /src/pillars/the-vault/codex-reborn/berlin-codex/index.11tydata.js
export default {
  layout: "base.njk",

  // === Identity ===
  pageId: "the-vault-codex-reborn-berlin-codex",
  permalink: "/pillars/the-vault/codex-reborn/berlin-codex/index.html",

  title: "Berlin Codex",
  tagline: "Hidden pages ✦ Restored wisdom ✦ The memory of the soul",
  description:
    "Recovered Gnostic texts preserved from the Berlin Codex — revelations of Mary, John, and Sophia restored within The Vault.",

  // === Pillar Metadata ===
  pillarId: "the-vault",
  pillarName: "The Vault",
  pillarUrl: "/pillars/the-vault/",
  pillarGlyph: "🜔",
  glyph: "📚",
  glyphRow: ["🜔", "📚", "🜔"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Berlin Codex", url: "/pillars/the-vault/codex-reborn/berlin-codex/" }
  ],

  // === Index Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/text/",
      title: "Gospel of Mary Magdalene",
      glyph: "🌸",
      tagline: "A dialogue between the risen Christ and Mary, revealing the soul’s ascent through the powers.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/apocryphon-of-john-fragment/text/",
      title: "Apocryphon of John (Fragment)",
      glyph: "📜",
      tagline: "A shorter recension of the revelation text, preserved as an alternate copy.",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Metadata ===
  socialImage: "/tgk-assets/images/share/the-vault/berlin-codex.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

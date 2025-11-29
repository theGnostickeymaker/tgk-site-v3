export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault",
  permalink: "/pillars/the-vault/index.html",

  title: "The Vault",
  tagline: "Codices ✦ Pages ✦ Erased Histories",
  description:
    "The Vault preserves forbidden, sacred, and erased writings. Codices, banned pages, mystical transmissions, and archival evidence protected against erasure.",

  // === Pillar Metadata ===
  pillarId: "the-vault",
  pillarName: "The Vault",
  pillarUrl: "/pillars/the-vault/",
  pillarGlyph: "🜔",
  glyph: "🜔",
  glyphRow: ["🜔", "🜍", "🜔"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  // === Overview & Intro ===
  introText:
    "The Vault holds forbidden texts, sacred writings, erased histories, and documents removed from public memory. Each collection safeguards what others tried to silence.",

  // === Sub-Collections Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/",
      title: "Codex Reborn",
      glyph: "📜",
      tagline: "Recovered Gnostic texts — Nag Hammadi, Berlin Codex, Gospel fragments.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/the-vault/forbidden-documents/",
      title: "Forbidden Documents",
      glyph: "🚫",
      tagline: "Erased, censored, or classified materials preserved for study.",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/mystical-traditions/",
      title: "Mystical Traditions",
      glyph: "✨",
      tagline: "Sacred writings from Egypt, Kabbalah, Sufi Islam, and lost initiatory systems.",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/paradise-papers/",
      title: "Paradise Papers",
      glyph: "💰",
      tagline: "Leaked archives exposing hidden wealth, laundering, and imperial hypocrisy.",
      tier: "adept",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/vault-index.jpg",
  ogTitle: "The Vault — Forbidden and Sacred Texts",
  ogDescription:
    "Browse codices, erased pages, and texts preserved against censorship and historical erasure.",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

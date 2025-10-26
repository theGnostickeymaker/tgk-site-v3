export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault",
  permalink: "/pillars/the-vault/index.html",
  title: "The Vault",
  description:
    "Preservation of forbidden and sacred texts — codices, pages, and erased histories.",
  tagline: "Codices ✦ pages ✦ erased histories",
  glyph: "⛪︎",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" }
  ],

  // === Subcollection Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/",
      title: "Codex Reborn",
      glyph: "📜",
      desc: "Recovered Gnostic texts — from Nag Hammadi to Berlin Codex.",
      state: "default",
      tier: "free"
    },
    {
      href: "/pillars/the-vault/forbidden-documents/",
      title: "Forbidden Documents",
      glyph: "🚫",
      desc: "Erased, banned, or classified texts preserved for study.",
      state: "default",
      tier: "initiate"
    },
    {
      href: "/pillars/the-vault/mystical-traditions/",
      title: "Mystical Traditions",
      glyph: "✨",
      desc: "Sacred writings from Egypt, Kabbalah, Sufi Islam, and more.",
      state: "default",
      tier: "initiate"
    },
    {
      href: "/pillars/the-vault/paradise-papers/",
      title: "Paradise Papers",
      glyph: "💰",
      desc: "Leaked archives on the hidden wealth and hypocrisy of empire.",
      state: "coming-soon",
      tier: "adept"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/vault-index.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

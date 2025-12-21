export default {
  layout: "base.njk",
  suppressPageTitle: true,

  pageId: "community-the-vault",
  permalink: "/pillars/tgk-community/threads/topics/the-vault/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Vault | TGK Community",

  tagline: "Discussion spaces for The Vault archive.",

  description:
    "Community discussion hub for The Vault. Use this space to share interpretations, compare translations, and connect passages to TGK investigations.",

  glyph: "⟡",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Vault" }
  ],

  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/discussion/",
      title: "The Vault (General Discussion)",
      glyph: "⟡",
      desc:
        "One thread for Vault-wide themes: symbolism, translation notes, cosmology, and links into TGK scrolls.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/",
      title: "Codex Reborn",
      glyph: "⌬",
      desc:
        "Collection-level discussions for Codex Reborn, including Nag Hammadi and Berlin Codex groupings.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

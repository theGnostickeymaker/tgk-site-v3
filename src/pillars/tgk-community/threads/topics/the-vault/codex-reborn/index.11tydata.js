export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Codex Reborn",

  title: "Codex Reborn — Discussion Hub",
  description:
    "Community discussion spaces aligned to Codex Reborn, the reconstructed Gnostic libraries preserved within The Vault.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "⟡",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn" }
  ],

  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/discussion/",
      title: "Codex Reborn (General Discussion)",
      glyph: "⟡",
      desc:
        "Cross-codex discussion for Codex Reborn, focusing on reconstruction, transmission, textual survival, and symbolic continuity.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/",
      title: "Nag Hammadi Library",
      glyph: "⌬",
      desc:
        "Discussion hub for the Nag Hammadi corpus, including individual codices, textual relationships, symbolic structures, and interpretive themes.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/berlin-codex/",
      title: "Berlin Codex",
      glyph: "⟁",
      desc:
        "Discussion hub for the Berlin Codex, preserving alternative apostolic voices, contested authority, and Gnostic texts transmitted outside the Nag Hammadi discovery.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

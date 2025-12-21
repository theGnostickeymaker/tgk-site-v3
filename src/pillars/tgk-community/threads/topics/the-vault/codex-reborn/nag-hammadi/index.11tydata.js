export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Codex Reborn",
  episodeTitle: "Nag Hammadi Library",

  title: "Nag Hammadi — Discussion Hub",
  description:
    "Discussion hub for the Nag Hammadi Library, organised by codex with access to codex-level synthesis and individual text discussions.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "⌬",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    { title: "Nag Hammadi" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/discussion/",
      title: "Nag Hammadi (General Discussion)",
      glyph: "⌬",
      desc:
        "Library-wide discussion of Nag Hammadi texts: cosmology, symbolism, textual relationships, and transmission.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/",
      title: "Codex I",
      glyph: "Ⅰ",
      desc: "Discussion hub for Codex I and its texts.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/",
      title: "Codex II",
      glyph: "Ⅱ",
      desc: "Discussion hub for Codex II and its texts.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-iii/",
      title: "Codex III",
      glyph: "Ⅲ",
      desc: "Discussion hub for Codex III and its texts.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/",
      title: "Codex V",
      glyph: "Ⅴ",
      desc: "Discussion hub for Codex V and its texts.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-vii/",
      title: "Codex VII",
      glyph: "Ⅶ",
      desc: "Discussion hub for Codex VII and its texts.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-viii/",
      title: "Codex VIII",
      glyph: "Ⅷ",
      desc: "Discussion hub for Codex VIII and its texts.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

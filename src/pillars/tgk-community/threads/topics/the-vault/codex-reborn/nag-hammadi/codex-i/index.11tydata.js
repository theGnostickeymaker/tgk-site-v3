export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex I",

  title: "Codex I — Discussion Hub",
  description:
    "Discussion hub for Codex I of the Nag Hammadi Library, with access to codex-level synthesis and individual text discussions.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅰ",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    { title: "Nag Hammadi", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex I" }
  ],

  topicGrid: [
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/discussion/",
    title: "Codex I (General Discussion)",
    glyph: "Ⅰ",
    desc:
      "Codex-level synthesis across all texts in Codex I.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/apocryphon-of-james/",
    title: "The Apocryphon of James",
    glyph: "📜",
    desc: "Discussion thread for The Apocryphon of James.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/gospel-of-truth/",
    title: "The Gospel of Truth",
    glyph: "✶",
    desc: "Discussion thread for The Gospel of Truth.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/prayer-of-the-apostle-paul/",
    title: "The Prayer of the Apostle Paul",
    glyph: "☩",
    desc: "Discussion thread for The Prayer of the Apostle Paul.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/treatise-on-the-resurrection/",
    title: "Treatise on the Resurrection",
    glyph: "☥",
    desc: "Discussion thread for Treatise on the Resurrection.",
    state: "active",
    tier: "free"
  },
  {
    href:
      "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-i/tripartite-tractate/",
    title: "The Tripartite Tractate",
    glyph: "⚯",
    desc: "Discussion thread for The Tripartite Tractate.",
    state: "active",
    tier: "free"
  }
],

  showLens: false,
  showSeriesNav: false
};

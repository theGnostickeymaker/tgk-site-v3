export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex II",

  title: "Codex II — Discussion Hub",
  description:
    "Discussion hub for Codex II of the Nag Hammadi Library, with access to codex-level synthesis and individual text discussions.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅱ",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    { title: "Nag Hammadi", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/discussion/",
      title: "Codex II (General Discussion)",
      glyph: "Ⅱ",
      desc:
        "Codex-level synthesis across all texts in Codex II.",
      state: "active",
      tier: "free"
    },

    // Text cards — links will resolve as you add them
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/",
      title: "The Apocryphon of John",
      glyph: "📜",
      desc: "Discussion thread for The Apocryphon of John.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/",
      title: "The Gospel of Thomas",
      glyph: "✶",
      desc: "Discussion thread for The Gospel of Thomas.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/",
      title: "The Gospel of Philip",
      glyph: "☥",
      desc: "Discussion thread for The Gospel of Philip.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/",
      title: "The Hypostasis of the Archons",
      glyph: "⚯",
      desc: "Discussion thread for The Hypostasis of the Archons.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/on-the-origin-of-the-world/",
      title: "On the Origin of the World",
      glyph: "🜂",
      desc: "Discussion thread for On the Origin of the World.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/exegesis-on-the-soul/",
      title: "Exegesis on the Soul",
      glyph: "🕊",
      desc: "Discussion thread for Exegesis on the Soul.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-ii/book-of-thomas/",
      title: "The Book of Thomas the Contender",
      glyph: "⚔",
      desc: "Discussion thread for The Book of Thomas the Contender.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex V",

  title: "Codex V — Discussion Hub",
  description:
    "Discussion hub for Codex V of the Nag Hammadi Library, centred on apocalyptic vision, judgement, ascent, martyrdom, and resistance to archontic power.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅴ",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    { title: "Nag Hammadi", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex V" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/discussion/",
      title: "Codex V (General Discussion)",
      glyph: "Ⅴ",
      desc:
        "Codex-level synthesis across Codex V, including judgement imagery, visionary ascent, martyrdom, and resistance to archontic authority.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-adam/",
      title: "The apocalypse of Adam",
      glyph: "⟁",
      desc:
        "Discussion thread for The apocalypse of Adam.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-paul/",
      title: "The Apocalypse of Paul",
      glyph: "☩",
      desc:
        "Discussion thread for The Apocalypse of Paul.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/first-apocalypse-of-james/",
      title: "The First Apocalypse of James",
      glyph: "⚯",
      desc:
        "Discussion thread for The First Apocalypse of James.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-v/second-apocalypse-of-james/",
      title: "The Second Apocalypse of James",
      glyph: "☉",
      desc:
        "Discussion thread for The Second Apocalypse of James.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

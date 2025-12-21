export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex VIII",

  title: "Codex VIII — Discussion Hub",
  description:
    "Discussion hub for Codex VIII of the Nag Hammadi Library, centred on epistolary revelation, apostolic authority, visionary ascent, and the transmission of esoteric knowledge.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅷ",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    {
      title: "Nag Hammadi",
      url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/"
    },
    { title: "Codex VIII" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-viii/discussion/",
      title: "Codex VIII (General Discussion)",
      glyph: "Ⅷ",
      desc:
        "Codex-level synthesis across Codex VIII, examining apostolic transmission, visionary authority, secrecy, and the ethics of revealed knowledge.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-viii/letter-of-peter-to-philip/",
      title: "Letter of Peter to philip",
      glyph: "☩",
      desc:
        "Discussion thread for the Letter of Peter to philip.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-viii/zostrianos/",
      title: "Zostrianos",
      glyph: "⚯",
      desc:
        "Discussion thread for Zostrianos.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

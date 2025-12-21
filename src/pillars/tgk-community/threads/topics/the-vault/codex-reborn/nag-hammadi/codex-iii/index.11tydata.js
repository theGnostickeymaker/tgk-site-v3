export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex III",

  title: "Codex III — Discussion Hub",
  description:
    "Discussion hub for Codex III of the Nag Hammadi Library, containing revelatory dialogues, salvific instruction, and cosmological insight.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅲ",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/" },
    { title: "Nag Hammadi", url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex III" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-iii/discussion/",
      title: "Codex III (General Discussion)",
      glyph: "Ⅲ",
      desc:
        "Codex-level synthesis across the texts of Codex III, including revelatory structure, salvific themes, and symbolic patterns.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-iii/gospel-of-the-egyptians/",
      title: "The Gospel of the Egyptians",
      glyph: "𓂀",
      desc: "Discussion thread for The Gospel of the Egyptians.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-iii/eugnostos-the-blessed/",
      title: "Eugnostos the Blessed",
      glyph: "✶",
      desc: "Discussion thread for Eugnostos the Blessed.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-iii/sophia-of-jesus-christ/",
      title: "The Sophia of Jesus Christ",
      glyph: "☥",
      desc: "Discussion thread for The Sophia of Jesus Christ.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

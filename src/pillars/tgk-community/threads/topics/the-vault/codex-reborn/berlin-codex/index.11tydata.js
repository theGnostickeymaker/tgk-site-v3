export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Codex Reborn",
  episodeTitle: "Berlin Codex",

  title: "Berlin Codex — Discussion Hub",
  description:
    "Discussion hub for the Berlin Codex, containing key Gnostic texts preserved outside the Nag Hammadi corpus, including revelations attributed to Mary Magdalene and other early voices.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "⟁",
  glyphRow: ["✦", "☉", "✦"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Discussion Threads", url: "/pillars/tgk-community/threads/" },
    { title: "The Vault", url: "/pillars/tgk-community/threads/topics/the-vault/" },
    {
      title: "Codex Reborn",
      url: "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/"
    },
    { title: "Berlin Codex" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/berlin-codex/discussion/",
      title: "Berlin Codex (General Discussion)",
      glyph: "⟁",
      desc:
        "Codex-level synthesis of the Berlin Codex, exploring alternative apostolic voices, contested authority, and Gnostic transmission outside the Nag Hammadi discovery.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
      title: "The Gospel of Mary",
      glyph: "☉",
      desc:
        "Discussion thread for the Gospel of Mary, examining post-resurrection teaching, inner ascent, feminine authority, and conflict over spiritual legitimacy.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

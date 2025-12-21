export default {
  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault",
  seasonTitle: "Nag Hammadi Library",
  episodeTitle: "Codex VII",

  title: "Codex VII — Discussion Hub",
  description:
    "Discussion hub for Codex VII of the Nag Hammadi Library, centred on revelatory cosmology, Sethian theology, divine speech, and the unfolding of transcendent knowledge.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  glyph: "Ⅶ",
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
    { title: "Codex VII" }
  ],

  topicGrid: [
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-vii/discussion/",
      title: "Codex VII (General Discussion)",
      glyph: "Ⅶ",
      desc:
        "Codex-level synthesis across Codex VII, exploring divine revelation, Sethian cosmology, emanation theology, and the articulation of transcendent speech.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-vii/second-treatise-of-the-great-seth/",
      title: "Second Treatise of the Great Seth",
      glyph: "⟁",
      desc:
        "Discussion thread for the Second Treatise of the Great Seth.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-vii/three-steles-of-seth/",
      title: "Three Steles of Seth",
      glyph: "☉",
      desc:
        "Discussion thread for the Three Steles of Seth.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-vault/codex-reborn/nag-hammadi/codex-vii/trimorphic-protennoia/",
      title: "Trimorphic Protennoia",
      glyph: "⚯",
      desc:
        "Discussion thread for Trimorphic Protennoia.",
      state: "active",
      tier: "free"
    }
  ],

  showLens: false,
  showSeriesNav: false
};

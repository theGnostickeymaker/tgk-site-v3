export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  title: "Codex III — Nag Hammadi",
  description:
    "Codex III contains treatises of cosmic revelation — including The Gospel of the Egyptians and Eugnostos the Blessed.",
  glyph: "📜",
    glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi"],
  tier: "free",

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex III", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/" }
  ],

  seriesIntro:
    "Codex III of the Nag Hammadi Library unites several visionary texts describing the emanations of the divine, the cosmos, and the restoration of the soul through hidden wisdom.",

  pillarGrid: [
    {
      title: "The Gospel of the Egyptians",
      desc: "A cosmic hymn to the Great Invisible Spirit and the aeons of divine light.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/gospel-of-the-egyptians/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Eugnostos the Blessed",
      desc: "A revelation of the structure of reality and the luminous aeons of the Pleroma.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/eugnostos-the-blessed/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "The Sophia of Jesus Christ",
      desc: "A dialogue between Christ and his disciples unveiling the origin of creation and the path of return.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/sophia-of-jesus-christ/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ]
};

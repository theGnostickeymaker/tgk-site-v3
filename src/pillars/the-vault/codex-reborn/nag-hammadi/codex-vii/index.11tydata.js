// /src/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/index.11tydata.js
export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-vii",

  title: "Nag Hammadi – Codex VII",
  description:
    "Codex VII preserves visionary hymns and treatises of the Sethian Gnostic tradition — the laughter of the true Christ, the praise of Seth, and the voice of the Divine Mind.",
  tagline: "Laughter ✦ Ascent ✦ The Voice of Light",

  glyph: "📜",
  glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-vii"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex VII", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/" }
  ],

  seriesIntro:
    "Codex VII gathers three central Sethian writings — The Second Treatise of the Great Seth, The Three Steles of Seth, and Trimorphic Protennoia — texts that embody divine irony, praise, and revelation.",

  // === Texts within Codex VII ===
  pillarGrid: [
    {
      title: "The Second Treatise of the Great Seth",
      desc: "A Gnostic discourse spoken in the voice of Christ — mocking the rulers who believed they crucified him and revealing the triumph of the Light beyond illusion.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/second-treatise-of-the-great-seth/",
      glyph: "🜃",
      tier: "free",
      state: "default"
    },
    {
      title: "The Three Steles of Seth",
      desc: "A hymn of ascent — the soul’s praise to the Light uttered in the name of Seth the Perfect One.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/three-steles-of-seth/",
      glyph: "🕯",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Trimorphic Protennoia",
      desc: "The primordial voice of the Divine Feminine — the Word before the world, speaking creation and redemption into being.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/trimorphic-protennoia/",
      glyph: "🌒",
      tier: "free",
      state: "coming-soon"
    }
  ],

  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi-codex-vii.jpg",

  showLens: false,
  showSeriesNav: false
};

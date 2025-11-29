export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-vii",
  permalink:
    "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/index.html",

  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-vii",

  // === Unified Header Hierarchy ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: "Codex Reborn",
  seriesTitle: "Nag Hammadi – Codex VII",
  seasonTitle: null,
  episodeTitle: null,
  partTitle: null,

  // === Display ===
  title: "Nag Hammadi – Codex VII",
  description:
    "Codex VII preserves visionary hymns and treatises of the Sethian Gnostic tradition, including the laughter of the true Christ, the praise of Seth, and the voice of the Divine Mind.",
  tagline: "Laughter ✦ Ascent ✦ The Voice of Light",

  glyph: "📜",
  glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-vii"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex VII",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/" }
  ],

  // === Intro Summary ===
  seriesIntro:
    "Codex VII gathers three central Sethian writings: The Second Treatise of the Great Seth, The Three Steles of Seth, and Trimorphic Protennoia. These texts embody divine irony, praise, and primordial revelation.",

  // === Texts within Codex VII ===
  pillarGrid: [
    {
      title: "The Second Treatise of the Great Seth",
      desc: "A Gnostic discourse spoken in the voice of Christ, mocking the rulers who believed they crucified him and revealing the triumph of the Light beyond illusion.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/second-treatise-of-the-great-seth/",
      glyph: "🜃",
      tier: "free",
      state: "default"
    },
    {
      title: "The Three Steles of Seth",
      desc: "A hymn of ascent, the soul’s praise to the Light uttered in the name of Seth the Perfect One.",
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

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-vault/nag-hammadi-codex-vii.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

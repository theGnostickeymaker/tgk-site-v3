export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-vii",
  title: "Nag Hammadi – Codex VII",
  description:
    "Codex VII preserves visionary hymns and treatises attributed to Sethian Gnosticism — including the laughter of the true Christ and the primordial voice of the Divine Mind.",
  glyph: "📜",
  bodyClass: "vault",
  accent: "vault",
  tier: "adept",

  // === Tagging ===
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-vii"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex VII", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/" }
  ],

  // === Texts within Codex VII ===
  pillarGrid: [
    {
      title: "The Second Treatise of the Great Seth",
      desc: "A Gnostic discourse spoken in the voice of Christ from the Pleroma — mocking the rulers who believed they crucified him and revealing the triumph of the true Light beyond illusion.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/second-treatise-of-the-great-seth/",
      glyph: "🜃",
      tier: "adept",
      state: "default"
    },
    {
      title: "The Three Steles of Seth",
      desc: "A hymn of ascent — the soul’s praise to the Light, uttered in the name of Seth the Perfect One.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/three-steles-of-seth/",
      glyph: "🕯",
      tier: "adept",
      state: "coming-soon"
    },
    {
      title: "Trimorphic Protennoia",
      desc: "The primordial voice of the Divine Feminine — the Word before the world, speaking creation and redemption into being.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/trimorphic-protennoia/",
      glyph: "🌒",
      tier: "adept",
      state: "coming-soon"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "The Final Idol – The Machine Messiah",
        path: "/pillars/the-gnostic-eye/the-final-idol/scroll-4/",
        desc: "Echoes of the same illusion — the rulers’ hubris and humanity’s awakening from their digital crucifixion."
      },
      {
        title: "Afterlife Series I – Gnostic Christianity (Part II)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/",
        desc: "Explores the immortal Christ who transcends death and illusion — a living presence that defies the Archons’ power."
      },
      {
        title: "SYSTEMIC – The Machine’s Mask",
        path: "/pillars/the-obsidian-key/systemic/the-machines-mask/",
        desc: "Parallels between ancient Archonic deception and the modern digital demiurge."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-vii%2Fcodex-vii.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: false
};

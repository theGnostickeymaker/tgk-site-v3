export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-i",
  title: "Gospel of Truth",
  description:
    "A meditation on ignorance, revelation, and the joy of return — attributed to Valentinus, revealing the mystery of remembrance and reunion with the Source.",
  glyph: "📜",
  bodyClass: "vault",
  accent: "vault",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-i", "gospel-of-truth"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex I", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/" },
    { title: "Gospel of Truth", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/gospel-of-truth/" }
  ],

  // === Local Series Navigation (within Codex I) ===
  seriesNav: [
    {
      title: "Tripartite Tractate",
      desc: "A grand cosmological narrative describing emanation, fall, and restoration within the divine Fullness.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/tripartite-tractate/"
    },
    {
      title: "Treatise on the Resurrection",
      desc: "A letter on spiritual rebirth and the awakening of the inner man, attributed to Rheginos.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/treatise-on-the-resurrection/"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part II)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/",
        desc: "Explores how the Gospel of Truth’s revelation of remembrance parallels the soul’s awakening from the Archonic dream."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-i%2Fgospel-of-truth.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton (alt edition available)",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

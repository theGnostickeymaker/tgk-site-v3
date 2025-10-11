export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",
  title: "Apocryphon of John",
  description:
    "The Secret Book of John — Sophia’s fall and the birth of Yaldabaoth. A revelation of the false cosmos and the soul’s hidden origin.",
  glyph: "🜂",
  bodyClass: "vault",
  accent: "vault",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-ii", "apocryphon-of-john"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    { title: "Apocryphon of John", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/" }
  ],

  // === Local Series Navigation (within Codex II) ===
  seriesNav: [
    {
      title: "Gospel of Thomas",
      desc: "Sayings of the living Jesus revealed to Thomas — the hidden wisdom of inner sight.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/"
    },
    {
      title: "Gospel of Philip",
      desc: "Teachings on unity, illusion, and the bridal chamber — unveiling mystical sacrament and self-knowledge.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/"
    },
    {
      title: "Hypostasis of the Archons",
      desc: "A mythic commentary on Genesis revealing the rulers who formed the false world and the spirit’s path of defiance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/"
    },
    {
      title: "On the Origin of the World",
      desc: "A cosmic retelling of creation, exposing the powers that shaped matter and the light that redeems it.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/on-the-origin-of-the-world/"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part I)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-1/",
        desc: "Explores Sophia’s descent and the Gnostic vision of the soul’s return through the Archons’ gates."
      },
      {
        title: "The Gnostic Eye – The Final Idol (Scroll II: The Digital Prophet)",
        path: "/pillars/the-gnostic-eye/the-final-idol/scroll-2/",
        desc: "Parallels between ancient revelation and modern AI prophecy — the machine as new Demiurge."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-ii%2Fapocryphon-of-john.pdf?alt=media",
    format: "translated",
    translator: "Frederik Wisse (Nag Hammadi Library in English)",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

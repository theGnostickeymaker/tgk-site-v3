export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",
  title: "The Hypostasis of the Archons",
  description:
    "Also known as *The Reality of the Rulers* — a Gnostic revelation describing the origin of the cosmic powers, their deception of humanity, and the soul’s deliverance through divine knowledge.",
  glyph: "💀",
  bodyClass: "vault",
  accent: "vault",
  tier: "initiate",

  // === Tagging ===
  tags: [
    "pillar",
    "the-vault",
    "codex-reborn",
    "nag-hammadi",
    "codex-ii",
    "hypostasis-of-the-archons"
  ],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "💀", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    {
      title: "The Hypostasis of the Archons",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/"
    }
  ],

  // === Local Series Navigation (within Codex II) ===
  seriesNav: [
    {
      title: "Apocryphon of John",
      desc: "Revelation granted to John by the Living Christ — unveiling Sophia’s fall, the false god Yaldabaoth, and the divine spark hidden within humanity.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/"
    },
    {
      title: "Gospel of Thomas",
      desc: "Sayings of the Living Jesus — the hidden wisdom of self-knowledge and remembrance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/"
    },
    {
      title: "Gospel of Philip",
      desc: "Teachings on unity, illusion, and the bridal chamber — unveiling mystical sacrament and the reunion of the soul with the Light.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/"
    },
    {
      title: "On the Origin of the World",
      desc: "A cosmic retelling of creation, exposing the powers that shaped matter and the Light that redeems it.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/on-the-origin-of-the-world/"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part III)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
        desc: "Explores how the Archons’ deception mirrors the soul’s trials through the false heavens and its liberation by remembrance."
      },
      {
        title: "The Obsidian Key – SYSTEMIC Scroll II: Forensic Fictions",
        path: "/pillars/the-obsidian-key/systemic/forensic-fictions/",
        desc: "Parallels the ancient Archons with modern rulers of perception and justice — the same machinery of control in a new guise."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-ii%2Fhypostasis-of-the-archons.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

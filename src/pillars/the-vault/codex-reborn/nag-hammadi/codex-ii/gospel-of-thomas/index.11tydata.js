export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",
  title: "The Gospel of Thomas",
  description:
    "114 sayings of the Living Jesus — the hidden gospel of self-knowledge and remembrance. A path of illumination through direct knowing of the Light within.",
  glyph: "📜",
  bodyClass: "vault",
  accent: "vault",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-ii", "gospel-of-thomas"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    { title: "The Gospel of Thomas", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/" }
  ],

  // === Local Series Navigation (within Codex II) ===
  seriesNav: [
    {
      title: "Apocryphon of John",
      desc: "A revelation granted to John by the Living Christ — unveiling Sophia’s fall, the false god Yaldabaoth, and the divine spark within humanity.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/"
    },
    {
      title: "Gospel of Philip",
      desc: "Teachings on unity, illusion, and the bridal chamber — the mystical reunion of the soul with the Light.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/"
    },
    {
      title: "Hypostasis of the Archons",
      desc: "A mythic commentary on Genesis revealing the rulers who formed the false world and the spirit’s path of defiance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/"
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
        title: "Afterlife Series I – Gnostic Christianity (Part II)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/",
        desc: "Explores the inner resurrection taught in Thomas — awakening through self-knowledge and remembrance of the Light within."
      },
      {
        title: "The Gnostic Eye – The Final Idol (Scroll III: Oracle in the Mirror)",
        path: "/pillars/the-gnostic-eye/the-final-idol/scroll-3/",
        desc: "Parallels between the mirror sayings of Thomas and modern self-reflection in the digital age."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-ii%2Fgospel-of-thomas.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

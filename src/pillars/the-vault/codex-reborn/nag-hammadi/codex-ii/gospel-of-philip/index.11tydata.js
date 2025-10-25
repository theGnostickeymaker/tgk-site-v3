export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",
  title: "The Gospel of Philip",
  description:
    "Teachings on union, illusion, and the bridal chamber — unveiling the mystery of spiritual rebirth and the reunion of the divided soul.",
  glyph: "🕯",
  bodyClass: "vault",
  accent: "vault",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-ii", "gospel-of-philip"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "🕯", "🜂"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    { title: "The Gospel of Philip", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/" }
  ],

  // === Local Series Navigation (within Codex II) ===
  seriesNav: [
    {
      title: "Apocryphon of John",
      desc: "A revelation granted to John by the Living Christ — unveiling Sophia’s fall, the false god Yaldabaoth, and the divine spark within humanity.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/"
    },
    {
      title: "Gospel of Thomas",
      desc: "Sayings of the Living Jesus — the hidden wisdom of self-knowledge and remembrance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/"
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
        title: "Afterlife Series I – Gnostic Christianity (Part III)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
        desc: "The Gospel of Philip mirrors the soul’s reunion with its divine twin — a return through love, remembrance, and sacred union."
      },
      {
        title: "The Gospel of Mary Magdalene",
        path: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
        desc: "Mary’s vision of the soul’s ascent parallels the inner purification and bridal union revealed in Philip’s teaching of the chamber."
      },
      {
        title: "Pistis Sophia",
        path: "/pillars/the-vault/codex-reborn/independent-texts/pistis-sophia/",
        desc: "Sophia’s descent and lament echo the divided soul’s longing to return — the same mystery of reunion celebrated in the Gospel of Philip."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-ii%2Fgospel-of-philip.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-ii-gospel-of-philip",
  permalink:
    "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/index.html",

  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",

  // === Unified Header Hierarchy ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: "Codex Reborn",
  seriesTitle: "Nag Hammadi – Codex II",
  seasonTitle: null,
  episodeTitle: "The Gospel of Philip",
  partTitle: null,

  // === Display ===
  title: "The Gospel of Philip",
  description:
    "Teachings on union, illusion, and the bridal chamber — unveiling the mystery of spiritual rebirth and the reunion of the divided soul.",
  tagline: "Union ✦ Mystery ✦ The Bridal Chamber of Light",

  glyph: "🕯",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: [
    "pillar",
    "the-vault",
    "codex-reborn",
    "nag-hammadi",
    "codex-ii",
    "gospel-of-philip"
  ],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    {
      title: "The Gospel of Philip",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/"
    }
  ],

  // === Local Series Navigation (Codex II) ===
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

  // === Synergist Lens ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part III)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
        desc: "The Gospel of Philip mirrors the soul’s reunion with its divine twin — a return through love, remembrance, and sacred union."
      },
      {
        title: "Gospel of Mary Magdalene",
        path: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
        desc: "Mary’s vision of ascent parallels the purification and bridal union revealed in the Gospel of Philip."
      },
      {
        title: "Pistis Sophia",
        path: "/pillars/the-vault/codex-reborn/independent-texts/pistis-sophia/",
        desc: "Sophia’s descent and lament echo the divided soul’s longing for reunion — the mystery celebrated in Philip’s bridal chamber teachings."
      }
    ]
  },

  // === Vault Source ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.appspot.com/o/vault%2Fnag-hammadi%2Fgospel-of-philip.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  // === Social ===
  socialImage: "/tgk-assets/images/share/the-vault/gospel-of-philip.jpg",

  // === behavior ===
  showLens: true,
  showSeriesNav: true
};

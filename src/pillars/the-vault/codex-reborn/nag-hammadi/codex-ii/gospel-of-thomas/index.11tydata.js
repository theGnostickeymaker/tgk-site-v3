export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-ii-gospel-of-thomas",
  permalink: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/index.html",

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
  episodeTitle: "The Gospel of Thomas",
  partTitle: null,

  title: "The Gospel of Thomas",
  description:
    "114 sayings of the Living Jesus — the hidden gospel of inner remembrance and direct self-knowledge. A path of illumination through immediate encounter with the Light within.",
  tagline: "Hidden Sayings ✦ Inner Revelation ✦ The Kingdom Within",

  glyph: "📜",
  glyphRow: ["🜂", "📜", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: [
    "pillar",
    "the-vault",
    "codex-reborn",
    "nag-hammadi",
    "codex-ii",
    "gospel-of-thomas"
  ],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    { title: "The Gospel of Thomas" }
  ],

  // === Local Series Navigation (Codex II) ===
  // These correctly point to INDEX pages
  seriesNav: [
    {
      title: "Apocryphon of John",
      desc: "A revelation of the false creator, Sophia’s fall, and the divine spark hidden within humanity.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/"
    },
    {
      title: "Gospel of Philip",
      desc: "Mystical teachings on unity, illusion, and the bridal chamber — the restoration of the divided soul.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/"
    },
    {
      title: "Hypostasis of the Archons",
      desc: "A mythic commentary on Genesis revealing the rulers of the false world and the spirit’s defiance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/"
    },
    {
      title: "On the Origin of the World",
      desc: "A cosmological revelation exposing the powers that shaped matter and the light that redeems it.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/on-the-origin-of-the-world/"
    }
  ],

  // === Synergist Lens (Cross-Series Links) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part II)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-2/",
        desc: "Explores the inner resurrection taught in Thomas — awakening through self-knowledge and remembrance of the Light within."
      },
      {
        title: "The Final Idol (Part III: Oracle in the Mirror)",
        path: "/pillars/the-gnostic-eye/the-final-idol/part-3/",
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

  // === Social Image ===
  socialImage: "/tgk-assets/images/share/the-vault/gospel-of-thomas.jpg",

  // === behavior Flags ===
  showLens: true,
  showSeriesNav: true
};

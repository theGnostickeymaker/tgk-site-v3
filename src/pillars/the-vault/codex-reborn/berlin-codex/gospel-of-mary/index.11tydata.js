export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "berlin-codex",
  title: "The Gospel of Mary Magdalene",
  description: "Mary Magdalene’s vision of the soul’s ascent and liberation through inner knowledge.",
  glyph: "🌹",
  bodyClass: "vault",
  accent: "vault",
  tier: "free", 

  // === Labels & Metadata ===
  tags: ["pillar", "the-vault", "codex-reborn", "berlin-codex", "gospel-of-mary"],
  glyphRow: ["💮", "🕯", "💮"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Berlin Codex", url: "/pillars/the-vault/codex-reborn/berlin-codex/" },
    { title: "The Gospel of Mary Magdalene", url: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/" }
  ],

  // === Series Links (Local Cross-Texts) ===
  seriesNav: [
    {
      title: "Apocryphon of John (Fragment)",
      desc: "A shorter variant of the revelation text, preserved alongside Mary’s gospel in the same codex.",
      url: "/pillars/the-vault/codex-reborn/berlin-codex/apocryphon-of-john-fragment/"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part III)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
        desc: "Explores Mary Magdalene’s hidden gospel and the soul’s ascent through the Powers."
      },
      {
        title: "The Keymaker’s Dream – The Magdalene Memory",
        path: "/pillars/the-keymakers-dream/magdalene-memory/",
        desc: "Reflective counterpart to the Gospel of Mary — remembering the divine feminine and Sophia’s restoration."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fgospel-of-mary.pdf?alt=media",
    format: "translated",
    translator: "Jean-Yves Leloup",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

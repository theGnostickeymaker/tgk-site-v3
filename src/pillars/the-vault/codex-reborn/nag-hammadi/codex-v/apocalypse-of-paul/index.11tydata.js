export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-v",
  title: "The Apocalypse of Paul",
  description:
    "Paul’s visionary ascent through the heavens — confronting toll gates, interrogators, and rulers of the cosmos, and discovering the soul’s liberation through hidden knowledge.",
  glyph: "🕯",
  bodyClass: "vault",
  accent: "vault",
  tier: "initiate",

  // === Tagging ===
  tags: [
    "pillar",
    "the-vault",
    "codex-reborn",
    "nag-hammadi",
    "codex-v",
    "apocalypse-of-paul"
  ],

  // === Header Glyph Row ===
  glyphRow: ["📜", "🕯", "📜"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex V", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/" },
    {
      title: "The Apocalypse of Paul",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-paul/"
    }
  ],

  // === Local Series Navigation (within Codex V) ===
  seriesNav: [
    {
      title: "First Apocalypse of James",
      desc: "A revelation of the risen Christ to James — teaching fearlessness before the Archons and the mysteries of deliverance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/first-apocalypse-of-james/"
    },
    {
      title: "Second Apocalypse of James",
      desc: "James receives hidden instructions for the soul’s ascent beyond the rulers of the world — the secret passwords of deliverance.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/second-apocalypse-of-james/"
    },
    {
      title: "Apocalypse of Adam",
      desc: "The primeval testament of Adam — revealing the fall of light and prophecy of redemption.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-adam/"
    },
    {
      title: "Fragment on the Origin of the World (Codex V Variant)",
      desc: "A parallel cosmological vision — differing in tone from Codex II yet sharing the same divine drama.",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/origin-fragment/"
    }
  ],

  // === Synergist Lens (Cross-Pillar Connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "Afterlife Series I – Gnostic Christianity (Part III)",
        path: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/part-3/",
        desc: "Paul’s ascent through the seven heavens mirrors the soul’s passage through the toll gates of the Archons in Gnostic afterlife teachings."
      },
      {
        title: "The Hypostasis of the Archons",
        path: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/",
        desc: "Both texts reveal the cosmic hierarchy and the interrogation of souls by the rulers of the lower heavens."
      },
      {
        title: "Gospel of Mary",
        path: "/pillars/the-vault/codex-reborn/berlin-codex/gospel-of-mary/",
        desc: "Mary’s ascent through the powers parallels Paul’s dialogue with the celestial rulers — two visions of liberation through knowledge."
      }
    ]
  },

  // === Vault Source Metadata ===
  vaultSource: {
    type: "PDF",
    path: "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.firebasestorage.app/o/the-vault%2Fcodex-reborn%2Fnag-hammadi%2Fcodex-v%2Fapocalypse-of-paul.pdf?alt=media",
    format: "translated",
    translator: "Bentley Layton / NHLE",
    language: "English",
    access: "public"
  },

  showLens: true,
  showSeriesNav: true
};

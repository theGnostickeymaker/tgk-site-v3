export default {
  layout: "base.njk",
  pillar: "the-resonant-key",
  title: "The Resonant Key",
  description:
    "The sound and voice of The Gnostic Key — where scrolls become vibration, ritual, and resonance. Spoken wisdom, sonic rites, and immersive journeys through the unseen.",
  glyph: "🎧",
  bodyClass: "resonant",
  accent: "resonant",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-resonant-key"],

  // === Header Glyph Row ===
  glyphRow: ["🎧", "🔊", "🌌"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Resonant Key", url: "/pillars/the-resonant-key/" }
  ],

  // === Resonant Series Grid ===
  pillarGrid: [
    { 
      href: "/pillars/the-resonant-key/audiobooks/", 
      title: "Audiobooks", 
      glyph: "📖", 
      desc: "Spoken scrolls of TGK — the living voice of revelation, story, and remembrance.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-resonant-key/sound-rituals/", 
      title: "Sound Rituals", 
      glyph: "🔊", 
      desc: "Immersive rites of vibration, frequency, and sacred memory — where sound becomes initiation.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-resonant-key/immersive-journeys/", 
      title: "Immersive Journeys", 
      glyph: "🌌", 
      desc: "Audio-visual pilgrimages through dream, myth, and the unseen layers of the Key.", 
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Synergist Lens (cross-pillar connections) ===
  synergistLens: {
    crossLinks: [
      {
        title: "The Keymaker’s Dream",
        path: "/pillars/the-keymakers-dream/",
        desc: "Fragments of the inner voice — the dream that first taught the Key to sing."
      },
      {
        title: "The Teachings – Afterlife Series",
        path: "/pillars/the-teachings/the-afterlife/",
        desc: "Turning scripture into resonance — sacred afterlife texts reborn as spoken ritual."
      },
      {
        title: "The Vault – Codex Reborn",
        path: "/pillars/the-vault/codex-reborn/",
        desc: "Where recovered words become sound — the gospels spoken back into light."
      }
    ]
  },

  // === Pillar Display Settings ===
  showLens: true,
  showSeriesNav: false
};

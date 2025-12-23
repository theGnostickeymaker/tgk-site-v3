export default {

  layout: "base.njk",

  siteTitle: "The Gnostic Key",
  pillarTitle: "TGK Community",
  gateTitle: "Community Threads",
  seriesTitle: "The Vault Hub",

  title: "TGK Community",
  description: "Structured discussion spaces aligned to the architecture of The Gnostic Key.",

  bodyClass: "community",
  accent: "community",
  tier: "free",

  showLens: false,
  showSeriesNav: false,

  topicGrid: [

    {
      href: "/pillars/tgk-community/threads/topics/steel-man-method/",
      title: "The Steel Man Method",
      desc: "A disciplined practice space for mastering intellectual honesty and fair argument.",
      glyph: "⚯",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },

    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/",
      title: "The Teachings",
      glyph: "✶",
      desc: "Discussion hubs for Afterlife, cosmology, metaphysics, and sacred traditions.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/",
      title: "The Obsidian Key",
      glyph: "🜂",
      desc: "Debate and analysis on power, corruption, law, and systemic control.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/",
      title: "The Gnostic Eye",
      glyph: "☿",
      desc: "Symbolic, archetypal, and investigative discussion threads.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-vault/",
      title: "The Vault",
      glyph: "🗄️",
      desc: "Textual analysis and discussion of preserved sacred and forbidden texts.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-forge/",
      title: "The Forge",
      glyph: "🗝️",
      desc: "Guest work, founder pages, and author hubs, where creators meet readers through structured dialogue.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-resonant-key/",
      title: "The Resonant Key",
      glyph: "🎧",
      desc: "Discussion on sound, music, resonance, and experiential media.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/tgk-community/threads/topics/childrens-corner/",
      title: "Children’s Corner",
      glyph: "🧸",
      desc: "Guided, age-appropriate discussion spaces for young seekers.",
      tier: "free",
      state: "coming-soon"
    }
  ]
};

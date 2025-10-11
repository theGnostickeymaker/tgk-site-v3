export default {
  layout: "base.njk",
  pillar: "the-gnostic-eye",
  title: "The Gnostic Eye",
  description:
    "Symbolic vision and revelation — decoding modern myths, idols, and the invisible architectures shaping belief and control.",
  glyph: "☿",
  bodyClass: "eye",
  accent: "eye",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-gnostic-eye"],

  // === Header Glyph Row ===
  glyphRow: ["☿", "🜏", "👁"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Gnostic Eye", url: "/pillars/the-gnostic-eye/" }
  ],

  // === Series Grid ===
  pillarGrid: [
    { 
      href: "/pillars/the-gnostic-eye/the-final-idol/", 
      title: "The Final Idol", 
      glyph: "🜏", 
      desc: "AI as idol, prophet, and antichrist — tracing the rise of the machine messiah through mirrors of belief and control.",
      tier: "free", 
      state: "default" 
    },
    { 
      href: "/pillars/the-gnostic-eye/the-puppet-strings/", 
      title: "The Puppet Strings", 
      glyph: "🔳", 
      desc: "Unveiling memetic control, narrative warfare, and the hidden masters of perception shaping world myth.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-gnostic-eye/the-archetype-wars/", 
      title: "The Archetype Wars", 
      glyph: "👁", 
      desc: "When gods and myths go to war — exploring the battle for collective imagination and spiritual allegiance.",
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Synergist Lens Placeholder ===
  synergistLens: {
    crossLinks: [
      {
        title: "The Obsidian Key – House of Grift",
        path: "/pillars/the-obsidian-key/house-of-grift/",
        desc: "Where the Eye observes the idols of empire — symbolic corruption exposed through light and shadow."
      },
      {
        title: "Afterlife Series – Buddhism: Part III",
        path: "/pillars/the-teachings/the-afterlife/series-1/buddhism/part-3/",
        desc: "Parallel visions of illusion and awakening — samsara as the original simulation."
      }
    ]
  },

  // === Pillar Display Settings ===
  showLens: true,
  showSeriesNav: false
};

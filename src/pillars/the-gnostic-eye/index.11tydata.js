export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-gnostic-eye-index",
  permalink: "/pillars/the-gnostic-eye/index.html",

  siteTitle: "The Gnostic Key",
  pillarTitle: "The Gnostic Eye",
  gateTitle: null,

  title: "The Gnostic Eye | Symbol reading, decoding illusion, unveiling the code beneath the world.",
  tagline: "Symbol reading, decoding illusion, unveiling the code beneath the world.",
  description:
    "Symbolic vision and revelation: decoding modern myths, idols, and the invisible architectures shaping belief and control.",

  // === Pillar Identity ===
  pillarId: "the-gnostic-eye",
  pillarName: "The Gnostic Eye",
  pillarUrl: "/pillars/the-gnostic-eye/",

  glyph: "☿",
  glyphRow: ["☿", "🜏", "👁"],
  accent: "eye",
  bodyClass: "eye",
  tier: "free",

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-gnostic-eye/the-gnostic-eye-index.jpg",
  socialAlt: "The Gnostic Eye symbolic frame and glyph.",

  // === Introduction ===
  introText:
    "Each series within The Gnostic Eye reveals the unseen forces shaping perception, belief, and power, from synthetic gods and false light to the geometry of allegiance.",

  // === Series Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-gnostic-eye/the-final-idol/",
      title: "The Final Idol",
      glyph: "🜏",
      tagline:
        "AI as idol, prophet, and antichrist: decoding synthetic spirituality, machine prophecy, and the false light of progress.",
      tier: "initiate-trial",
      state: "active"
    },
    {
      href: "/pillars/the-gnostic-eye/the-martyr-of-memory/",
      title: "The Martyr of Memory",
      glyph: "🕱",
      tagline:
        "Preserving what was erased: forbidden knowledge, vanished truths, and the spiritual cost of forgetting.",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-gnostic-eye/the-architecture-of-control/",
      title: "The Architecture of Control",
      glyph: "🏙️",
      tagline:
        "Smart cities, silent obedience, and the geometry of digital captivity disguised as innovation.",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-gnostic-eye/the-archetype-war/",
      title: "The Archetype War",
      glyph: "⚔️",
      tagline:
        "Media as myth, politics as ritual: decoding the symbols that weaponise collective consciousness.",
      tier: "initiate",
      state: "coming-soon"
    }
  ],

  // === Social Card Set (optional but preserved) ===
  socialImages: {
    x: "/tgk-assets/images/share/the-gnostic-eye/gnostic-eye-index@x-v2.jpg",
    square: "/tgk-assets/images/share/the-gnostic-eye/gnostic-eye-index@square-v2.jpg",
    portrait: "/tgk-assets/images/share/the-gnostic-eye/gnostic-eye-index@portrait-v2.jpg",
    story: "/tgk-assets/images/share/the-gnostic-eye/gnostic-eye-index@story-v2.jpg",
    hero: "/tgk-assets/images/share/the-gnostic-eye/gnostic-eye-index@hero-v2.jpg"
  },

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Gnostic Eye", url: "/pillars/the-gnostic-eye/" }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

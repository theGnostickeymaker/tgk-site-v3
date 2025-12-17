export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-gnostic-eye",
  permalink: "/pillars/tgk-community/threads/topics/the-gnostic-eye/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Gnostic Eye | TGK Community",

  tagline: "Discussion spaces aligned to The Gnostic Eye pillar.",

  description:
    "Community discussion hubs for The Gnostic Eye pillar, structured to mirror its symbolic investigations, archetypal analyses, and modern myth-breaking series.",

  glyph: "🜏",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Gnostic Eye" }
  ],

  // === Gnostic Eye Discussion Gates ===
  topicGrid: [

    // === Pillar-level discussion ===
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/discussion/",
      title: "The Gnostic Eye (Pillar Discussion)",
      glyph: "🜏",
      desc:
        "Pillar-level discussion for symbolic interpretation of current events, mythic structures, power archetypes, and the spiritual mechanics behind modern systems.",
      state: "active",
      tier: "free"
    },

    // === Series-level discussions ===
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/",
      title: "The Final Idol",
      glyph: "🜏",
      desc:
        "Discussion hub for AI as idol, prophet, and antichrist, decoding synthetic spirituality, machine prophecy, and the false light of progress.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-martyr-of-memory/",
      title: "The Martyr of Memory",
      glyph: "🕱",
      desc:
        "Discussion hub for erased history, forbidden knowledge, memory-holing, and the spiritual cost of forgetting.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-architecture-of-control/",
      title: "The Architecture of Control",
      glyph: "🏙️",
      desc:
        "Discussion hub on smart cities, silent obedience, surveillance architectures, and digital captivity disguised as innovation.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-archetype-war/",
      title: "The Archetype War",
      glyph: "⚔️",
      desc:
        "Discussion hub for media myth-making, politics as ritual, and the weaponisation of collective consciousness.",
      state: "coming-soon",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

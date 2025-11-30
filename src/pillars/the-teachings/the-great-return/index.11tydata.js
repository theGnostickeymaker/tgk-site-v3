export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-great-return",
  permalink: "/pillars/the-teachings/the-great-return/index.html",

  title: "The Gnostic Key | The Great Return | Death, Rebirth, and the Hidden Architecture of the Soul",
  
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Teachings",
  gateTitle: "The Great Return",
  tagline: "Return, remembrance, renewal",
  
  description:
    "The unifying arc of The Teachings. A map of remembrance that traces the soul’s passage through death, rebirth, inner awakening, and the recovery of its original knowledge.",
  
  glyph: "☥",
  glyphRow: ["☥", "🜂", "☥"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    {
      title: "The Great Return",
      url: "/pillars/the-teachings/the-great-return/"
    }
  ],

  // === Series Grid (The Great Return contains multiple Series) ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-great-return/the-afterlife/",
      title: "Series I: The Afterlife",
      glyph: "☸",
      desc:
        "Six-episode initiation into the world’s afterlife traditions. Death, rebirth, cosmology, and the soul’s passage beyond the veil.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-great-return/temple-of-the-afterlife/",
      title: "Series II: Temple of the Afterlife",
      glyph: "🕯",
      desc:
        "Advanced teachings on the subtle body, inner gates, and the sacred architecture of spiritual passage.",
      state: "coming-soon",
      tier: "adept"
    },
    {
      href: "/pillars/the-teachings/the-great-return/the-human-question/",
      title: "Series III: The Human Question",
      glyph: "👁",
      desc:
        "How sacred traditions define the human being, the nature of consciousness, and the war for the soul.",
      state: "coming-soon",
      tier: "adept"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-teachings/the-great-return/the-great-return-index.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: true
};
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-teachings",
  permalink: "/pillars/the-teachings/index.html",
  title: "The Teachings",
  description:
    "Pages of wisdom, initiation, and remembrance — the spiritual foundation of The Gnostic Key.",
  tagline: "Ancient wisdom ✦ modern revelation ✦ paths of remembrance",
  glyph: "⛪︎",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" }
  ],

  // === Subcollection Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/",
      title: "The Afterlife Series",
      glyph: "☥",
      desc: "Maps of death, rebirth, and remembrance across traditions.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/know-your-rights/",
      title: "Know Your Rights",
      glyph: "⚖",
      desc: "Pages of civil liberty, law, and self-defence.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/the-teachings/sacred-pedagogy/",
      title: "Sacred Pedagogy",
      glyph: "📜",
      desc: "Teachings and exercises for initiates of truth.",
      state: "coming-soon",
      tier: "initiate"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-teachings/the-teachings-index.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-teachings",
  permalink: "/pillars/the-teachings/index.html",

  title: "The Gnostic Key | The Teachings | Spiritual Wisdom, Ancient Traditions and Paths of Inner Sovereignty",
  siteTitle: "The Gnostic Key",

  pillarTitle: "The Teachings",
  tagline: "Ancient wisdom, modern revelation, paths of remembrance",
  
  description:
    "The spiritual and civic foundation of The Gnostic Key. Pages of wisdom, initiation, and remembrance for seekers of every path.",
  
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

  // === Pillar Grid: Series Level ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-great-return/",
      title: "The Great Return",
      glyph: "☥",
      desc:
        "Teachings on remembrance and return. The unified arc of death, rebirth, inner passage, and the recovery of the soul’s original knowledge.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-sovereign-path/",
      title: "The Sovereign Path",
      glyph: "⚖",
      desc:
        "Rights, autonomy, civic self-defence, and the restoration of sovereignty. A practical curriculum for living freely in a managed age.",
      state: "coming-soon",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-childrens-codex/",
      title: "The Children’s Codex",
      glyph: "📜",
      desc:
        "The TGK homeschool curriculum. Foundations of knowledge, memory, imagination, and ethics for the next generation.",
      state: "coming-soon",
      tier: "initiate-trial"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-teachings/the-teachings-index.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-teachings",
  permalink: "/pillars/the-teachings/index.html",
  title: "The Teachings",
  description:
    "Pages of wisdom, initiation, and remembrance. The spiritual and civic foundation of The Gnostic Key.",
  tagline: "Ancient wisdom, modern revelation, paths of remembrance",
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

  // === Pillar Grid: Series Only ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-great-return/",
      title: "The Great Return",
      glyph: "☥",
      desc: "The master spiritual arc of death, rebirth, and the architecture of the soul.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-sovereign-path/",
      title: "The Sovereign Path",
      glyph: "⚖",
      desc: "Rights, autonomy, civic self-defence, and the restoration of sovereignty.",
      state: "coming-soon",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-childrens-codex/",
      title: "The Children’s Codex",
      glyph: "📜",
      desc: "The TGK homeschool curriculum. Foundations of knowledge for the next generation.",
      state: "coming-soon",
      tier: "initiate-trial"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-teachings/the-teachings-index.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

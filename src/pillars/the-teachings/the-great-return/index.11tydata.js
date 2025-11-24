export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-great-return",
  permalink: "/pillars/the-teachings/the-great-return/index.html",
  title: "The Great Return",
  description:
    "The master spiritual arc of The Teachings, mapping death, rebirth, remembrance, and the architecture of the soul.",
  tagline: "Return, remembrance, renewal",
  glyph: "☥",
  glyphRow: ["☥", "🜂", "☥"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Great Return", url: "/pillars/the-teachings/the-great-return/" }
  ],

  // === Season Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-great-return/the-afterlife/",
      title: "Series 1: The Afterlife Scrolls",
      glyph: "☸",
      desc: "Twelve episodes on death, rebirth, and post-mortem cosmology across world traditions.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-teachings/the-great-return/temple-of-the-afterlife/",
      title: "Series 2: Temple of the Afterlife",
      glyph: "🕯",
      desc: "Advanced initiatory teachings on the subtle body and spiritual passageways.",
      state: "coming-soon",
      tier: "adept"
    },
    {
      href: "/pillars/the-teachings/the-great-return/the-human-question/",
      title: "Series 3: The Human Question",
      glyph: "👁",
      desc: "How sacred traditions define the human being and the war for the soul.",
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

export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-the-great-return",
  permalink: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Great Return | TGK Community",

  tagline: "Discussion spaces aligned to The Great Return.",

  description:
    "Community discussion hubs for The Great Return, structured to mirror its series, seasons, and initiatory arcs.",

  glyph: "☥",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Teachings", url: "/pillars/tgk-community/threads/topics/the-teachings/" },
    { title: "The Great Return" }
  ],

  // === The Great Return Discussion Gates ===
  topicGrid: [

    // === Series-level discussion ===
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/discussion/",
      title: "The Great Return (Series Discussion)",
      glyph: "☥",
      desc:
        "Cross-series discussion of The Great Return as a whole, including structure, symbolism, and initiatory themes.",
      state: "active",
      tier: "free"
    },

    // === Sub-series discussion hubs ===
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/",
      title: "Series I: The Afterlife",
      glyph: "☸",
      desc:
        "Discussion hub for afterlife traditions, death cosmologies, rebirth doctrines, and the soul’s passage beyond the veil.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/temple-of-the-afterlife/",
      title: "Series II: Temple of the Afterlife",
      glyph: "🕯",
      desc:
        "Advanced discussion on the subtle body, inner gates, and sacred architectures of spiritual passage.",
      state: "coming-soon",
      tier: "adept"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-human-question/",
      title: "Series III: The Human Question",
      glyph: "👁",
      desc:
        "Discussion on how traditions define the human being, consciousness, and the struggle for the soul.",
      state: "coming-soon",
      tier: "adept"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

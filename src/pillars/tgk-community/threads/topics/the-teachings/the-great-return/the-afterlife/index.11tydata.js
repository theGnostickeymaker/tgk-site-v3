export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-afterlife",
  permalink: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Afterlife | TGK Community",

  tagline: "Discussion spaces aligned to Series I: The Afterlife.",

  description:
    "Community discussion hubs for Series I: The Afterlife, structured to mirror its seasons and episode gateways across global traditions.",

  glyph: "☸",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Teachings", url: "/pillars/tgk-community/threads/topics/the-teachings/" },
    { title: "The Great Return", url: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/" },
    { title: "The Afterlife" }
  ],

  // === The Afterlife Discussion Gates ===
  topicGrid: [

    // === Series-level discussion ===
    {
      href: "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/discussion/",
      title: "The Afterlife (Series Discussion)",
      glyph: "☸",
      desc:
        "Cross-tradition discussion of afterlife cosmologies, death rites, rebirth doctrines, and the soul’s passage beyond the physical world.",
      state: "active",
      tier: "free"
    },

    // === Season-level discussion hubs ===
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/",
      title: "Season I: Maps of the Afterlife",
      glyph: "🜂",
      desc:
        "Discussion hub for six global afterlife traditions, each offering a distinct map of death, rebirth, and return.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-2/",
      title: "Season II: Maps of the Afterlife",
      glyph: "🜁",
      desc:
        "Further gateways into the hidden passages of the soul, expanding the architecture of remembrance and return.",
      state: "coming-soon",
      tier: "adept"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

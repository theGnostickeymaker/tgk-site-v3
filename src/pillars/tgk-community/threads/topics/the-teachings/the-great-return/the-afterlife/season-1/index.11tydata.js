export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-afterlife-season-1",
  permalink:
    "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/index.html",

  siteTitle: "The Gnostic Key",
  title: "Season I: Maps of the Afterlife | TGK Community",

  tagline: "Discussion spaces aligned to Season I: Maps of the Afterlife.",

  description:
    "Community discussion hubs for Season I: Maps of the Afterlife, structured around individual traditions and their distinct cosmologies of death, rebirth, and liberation.",

  glyph: "🜂",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    {
      title: "The Teachings",
      url: "/pillars/tgk-community/threads/topics/the-teachings/"
    },
    {
      title: "The Great Return",
      url:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/"
    },
    {
      title: "The Afterlife",
      url:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/"
    },
    { title: "Season I" }
  ],

  // === Season I Discussion Gates ===
  topicGrid: [

    // === Season-level discussion ===
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/discussion/",
      title: "Season I: Maps of the Afterlife (Season Discussion)",
      glyph: "🜂",
      desc:
        "Cross-tradition discussion of the six afterlife cosmologies in Season I, including shared symbols, contrasts, and recurring metaphysical themes.",
      state: "active",
      tier: "free"
    },

    // === Episode-level discussion hubs ===
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/gnostic-christianity/",
      title: "Gnostic Christianity",
      glyph: "✝",
      desc:
        "Discussion of Gnostic Christian cosmology, salvation, archons, and liberation of the divine spark.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/sufi-islam/",
      title: "Sufi Islam",
      glyph: "☪",
      desc:
        "Discussion of Sufi cosmology, annihilation, subsistence, and the soul’s return to the Beloved.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/kabbalah/",
      title: "Kabbalah",
      glyph: "✡",
      desc:
        "Discussion of Kabbalistic afterlife doctrine, soul fragments, repair, and ascent through the worlds.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/buddhism/",
      title: "Buddhism",
      glyph: "☸",
      desc:
        "Discussion of Buddhist death teachings, bardos, rebirth, and liberation from cyclic existence.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/ancient-egypt/",
      title: "Ancient Egypt",
      glyph: "☥",
      desc:
        "Discussion of Egyptian afterlife beliefs, judgment of the heart, and eternal continuity.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-teachings/the-great-return/the-afterlife/season-1/mesoamerica/",
      title: "Mesoamerica",
      glyph: "𓆰",
      desc:
        "Discussion of Mesoamerican death cosmologies, soul journeys, and ritual continuity.",
      state: "active",
      tier: "free",
      minWriteTier: "initiate"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-afterlife-season-1",
  permalink:
    "/pillars/the-teachings/the-great-return/the-afterlife/season-1/index.html",

  siteTitle: "The Gnostic Key",
  pillarTitle: "The Teachings",
  gateTitle: "The Great Return",
  seriesTitle: "Series I: The Afterlife",
  seasonTitle: "Season I: Maps of the Afterlife",

  title: "Season I: Maps of the Afterlife",
  tagline: "Through death’s veil the soul remembers and the light returns.",
  description:
    "The opening season of The Great Return. Six world traditions, each preserving a unique map of death, rebirth, judgement, transformation, and the soul’s return to its origin.",

  // === Hierarchy Metadata ===
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/",

  seriesId: "the-great-return",
  seriesUrl: "/pillars/the-teachings/the-great-return/",

  seasonNumber: 1,

  glyph: "☥",
  glyphRow: ["✶", "☥", "✶"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",

  // === Season Overview ===
  landing: {
    title: "The Afterlife — Season I",
    description:
      "Six traditions, six gates of return. Begin the journey through the soul’s passage beyond the veil."
  },

  introText:
    "Choose an episode. Each tradition reveals a different architecture of death, rebirth, and remembrance.",

  // === Episode Grid ===
  pillarGrid: [
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/gnostic-christianity/",
      title: "Gnostic Christianity",
      glyph: "✝",
      tagline: "The false cosmos, Christ the Revealer, and the soul’s return.",
      tier: "free",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/sufi-islam/",
      title: "Sufi Islam",
      glyph: "☪",
      tagline: "The seeker’s path through love, annihilation, and divine return.",
      tier: "verified",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/kabbalah/",
      title: "Kabbalah",
      glyph: "✡",
      tagline: "The Tree of Life, the soul’s descent, and the light of restoration.",
      tier: "verified",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/buddhism/",
      title: "Buddhism",
      glyph: "☸",
      tagline: "The Wheel, the Heart, and the Clear Light of Compassion.",
      tier: "initiate",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/ancient-egypt/",
      title: "Ancient Egypt",
      glyph: "𓂀",
      tagline:
        "The Weighing of the Heart, the Duat, and the Book of Coming Forth by Day.",
      tier: "initiate",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/mesoamerica/",
      title: "Mesoamerica",
      glyph: "🌽",
      tagline:
        "Sacred time, cosmic descent, and the calendrical architecture of death and return.",
      tier: "initiate",
      state: "active"
    }
  ],

  // === Cross-Episode Navigation ===
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos, Christ the Revealer, and the soul’s return.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/gnostic-christianity/"
    },
    {
      title: "Sufi Islam",
      desc: "The seeker’s path through love, annihilation, and return.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/sufi-islam/"
    },
    {
      title: "Kabbalah",
      desc: "The path of Kabbalah within the Afterlife Scrolls.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/kabbalah/"
    },
    {
      title: "Buddhism",
      desc: "The path of Buddhism within the Afterlife Scrolls.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/buddhism/"
    },
    {
      title: "Ancient Egypt",
      desc: "The path of Ancient Egypt within the Afterlife Scrolls.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/ancient-egypt/"
    },
    {
      title: "Mesoamerica",
      desc: "The path of Mesoamerica within the Afterlife Scrolls.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/mesoamerica/"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-teachings/the-great-return/season-1/the-afterlife.jpg",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Great Return", url: "/pillars/the-teachings/the-great-return/" },
    {
      title: "Season I: The Afterlife",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/"
    }
  ],

  // === behavior Flags ===
  showLens: false,
  showSeriesNav: true
};
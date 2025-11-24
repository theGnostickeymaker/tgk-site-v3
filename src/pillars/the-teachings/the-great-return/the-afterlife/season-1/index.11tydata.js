export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-afterlife-season-1",
  permalink:
    "/pillars/the-teachings/the-great-return/the-afterlife/season-1/index.html",

  title: "Season I: The Afterlife Scrolls",
  tagline: "Through death’s veil, the soul remembers and the light returns.",
  description:
    "The first six traditions of the Afterlife arc, exploring the pathways of death, rebirth, judgement, transformation and remembrance.",

  // === Hierarchy Metadata ===
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/",

  seriesId: "the-great-return",
  seriesName: "The Great Return",
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
      "Six traditions, six gates of return: a journey through the soul’s passage beyond the veil."
  },

  introText:
    "Choose an episode — each tradition reveals a different face of the afterlife and the soul’s return.",

  // === Episode Grid ===
  pillarGrid: [
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/gnostic-christianity/",
      title: "Gnostic Christianity",
      glyph: "✝",
      tagline: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
      tier: "free",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/sufi-islam/",
      title: "Sufi Islam",
      glyph: "☪",
      tagline: "The seeker’s path through love, annihilation and divine return.",
      tier: "free",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/kabbalah/",
      title: "Kabbalah",
      glyph: "✡",
      tagline: "The Tree of Life ✦ the soul’s descent ✦ the light of restoration.",
      tier: "free",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/buddhism/",
      title: "Buddhism",
      glyph: "☸",
      tagline: "The Wheel ✦ The Heart ✦ The Clear Light of Compassion.",
      tier: "initiate",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/ancient-egypt/",
      title: "Ancient Egypt",
      glyph: "𓂀",
      tagline:
        "The Weighing of the Heart ✦ The Duat ✦ The Book of Coming Forth by Day.",
      tier: "initiate",
      state: "active"
    },
    {
      href:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/mesoamerica/",
      title: "Mesoamerica",
      glyph: "🌽",
      tagline: "Three-part journey through the false cosmos and the Revealer.",
      tier: "initiate",
      state: "active"
    }
  ],

  // === Cross-Episode Navigation ===
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos, Christ the Revealer and the soul’s return.",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/gnostic-christianity/"
    },
    {
      title: "Sufi Islam",
      desc: "The seeker’s path through love, annihilation and return.",
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
    "/tgk-assets/images/share/the-teachings/the-great-return/season-1/the-afterlife-scrolls.jpg",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Great Return", url: "/pillars/the-teachings/the-great-return/" },
    {
      title: "Season I: The Afterlife Scrolls",
      url:
        "/pillars/the-teachings/the-great-return/the-afterlife/season-1/"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: true
};

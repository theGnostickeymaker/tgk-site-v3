export default {
  // 🌌 Series Overview
  landing: {
    title: "The Afterlife — Series 1",
    description:
      "Three-part journey through the false cosmos, the Revealer, and the soul’s return."
  },

  introText: "Choose an episode — each path reveals a different face of the afterlife.",

  // 🔹 Series Identity
  pillar: "the-teachings",
  series: "the-afterlife",
  seriesMeta: {
    number: 1,
    label: "Series 1",
    series_version: 1
  },

  // 🜂 Episode Grid (visible cards)
pillarGrid: [
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/",
    title: "Gnostic Christianity",
    glyph: "✝",
    tagline: "The false cosmos ✦ Christ the Revealer ✦ the soul’s return.",
    tier: "free",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/",
    title: "Sufi Islam",
    glyph: "☪",
    tagline: "The seeker’s path through love, annihilation, and divine return.",
    tier: "free",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/",
    title: "Kabbalah",
    glyph: "✡",
    tagline: "The Tree of Life ✦ the soul’s descent ✦ the light of restoration.",
    tier: "free",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/buddhism/",
    title: "Buddhism",
    glyph: "☸",
    tagline: "The Wheel ✦ The Heart ✦ The Clear Light of Compassion.",
    tier: "initiate",
    state: "active"
  },
  {
    href: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/",
    title: "Ancient Egypt",
    glyph: "𓂀",
    tagline: "The Weighing of the Heart ✦ The Duat ✦ The Book of Coming Forth by Day.",
    tier: "initiate",
    state: "active"
  }
,
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/mesoamerica/",
      title: "Mesoamerica",
      glyph: "🌽",
      tagline: "Three-part journey through the false cosmos and the Revealer.",
      tier: "initiate",
        state: "active"
    }
  ],

  // 🧭 Cross-Episode Navigation (series map)
  seriesNav: [
    {
      title: "Gnostic Christianity",
      desc: "The false cosmos, Christ the Revealer, and the soul’s return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/gnostic-christianity/"
    },
    {
      title: "Sufi Islam",
      desc: "The seeker’s path through love, annihilation, and return.",
      url: "/pillars/the-teachings/the-afterlife/series-1/sufi-islam/"
    }
  ,
    {
      title: "Kabbalah",
      desc: "The path of Kabbalah within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/"
    }
  ,
    {
      title: "Buddhism",
      desc: "The path of Buddhism within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/"
    }
  ,
    {
      title: "Ancient Egypt",
      desc: "The path of Ancient Egypt within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/"
    }
  ,
    {
      title: "Mesoamerica",
      desc: "The path of Mesoamerica within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/mesoamerica/"
    }
  ],

  // 🧱 Layout + Defaults
  layout: "base.njk",

  // 🧭 Breadcrumbs
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
    { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" }
  ]
};

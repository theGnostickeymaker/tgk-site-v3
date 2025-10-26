export default {
  layout: "base.njk",

  // 🌍 Pillar & Series Metadata
  pageId: "the-teachings-the-afterlife-series-1-kabbalah",
  permalink:
    "/pillars/the-teachings/the-afterlife/series-1/kabbalah/index.html",
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/the-afterlife/",
  pillarGlyph: "✡",
  glyphRow: ["✡", "☥", "✡"],
  accent: "gold",
  bodyClass: "gold",
  tier: "free",
  title: "Kabbalah",
  tagline: "The Tree of Life ✦ The Soul’s Ascent ✦ The Return to Divine Harmony",
  description:
    "The Tree of Life, the ascent of the soul, and the restoration of divine harmony.",

  // 📖 Series Identity
  seriesLabel: "The Afterlife Series",
  pillarLabel: "The Teachings",
  seriesHome: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/",
  pillarHome: "/pillars/the-teachings/",
  series: "the-afterlife",
  episode: 3,
  seriesMeta: {
    number: 1,
    label: "Series 1",
    version: 1
  },

  // 🜂 Episode Overview
  introText:
    "— a three-part journey through the Tree of Life, the soul’s ascent, and the restoration of divine harmony.",
  disclaimerTitle: "⚠️ Diversity of Sources",
  disclaimerText:
    "<p>Interpretations vary across Kabbalistic schools and traditions — Lurianic, Zoharic, and Hermetic alike. Each offers a distinct map of emanation and return.</p>",

  // 🔹 Episode Parts
  episodeParts: [
    {
      title: "Part I — The Kabbalistic Worldview",
      desc: "Creation, emanation, and the hidden structure of the Tree of Life.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-1/"
    },
    {
      title: "Part II — Ten Thresholds of Light",
      desc: "The soul’s ascent through the Sefirot — the luminous thresholds of being.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-2/"
    },
    {
      title: "Part III — The Soul’s Journey After Death",
      desc: "Crossing the veils, uniting the lower and higher worlds, and the return to divine harmony.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-3/"
    }
  ],

  // 🧭 Cross-Episode Navigation
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
    },
    {
      title: "Kabbalah",
      desc: "The path of Kabbalah within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/"
    },
    {
      title: "Buddhism",
      desc: "The path of Buddhism within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/buddhism/"
    },
    {
      title: "Ancient Egypt",
      desc: "The path of Ancient Egypt within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/ancient-egypt/"
    },
    {
      title: "Mesoamerica",
      desc: "The path of Mesoamerica within the Afterlife Series.",
      url: "/pillars/the-teachings/the-afterlife/series-1/mesoamerica/"
    }
  ],

  // 🧭 Episode Landing Cards
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-1/",
      title: "Part I — The Kabbalistic Worldview",
      glyph: "✡",
      tagline: "Creation ✦ emanation ✦ the hidden Tree of Life.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-2/",
      title: "Part II — Ten Thresholds of Light",
      glyph: "✡",
      tagline: "Ascent ✦ purification ✦ illumination through the Sefirot.",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/part-3/",
      title: "Part III — The Soul’s Journey After Death",
      glyph: "✡",
      tagline: "Veils ✦ unity ✦ return to divine harmony.",
      tier: "free",
      state: "default"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-teachings/the-afterlife/kabbalah.jpg",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Teachings", url: "/pillars/the-teachings/" },
    { title: "The Afterlife", url: "/pillars/the-teachings/the-afterlife/" },
    { title: "Series 1", url: "/pillars/the-teachings/the-afterlife/series-1/" },
    { title: "Kabbalah", url: "/pillars/the-teachings/the-afterlife/series-1/kabbalah/" }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: true
};

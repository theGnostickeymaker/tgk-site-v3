export default {
  layout: "base.njk",
  pillar: "childrens-corner",
  title: "Children’s Corner",
  description:
    "A soft and shining space for young seekers — stories, parables, and gentle guides to light and kindness.",
  glyph: "🧸",
  bodyClass: "children",
  accent: "children",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "childrens-corner"],

  // === Header Glyph Row ===
  glyphRow: ["✨", "🧸", "🌙"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "Children’s Corner", url: "/pillars/childrens-corner/" }
  ],

  // === Pillar Grid (Future Series) ===
  pillarGrid: [
    { 
      href: "#", 
      title: "Parables for Young Seekers", 
      glyph: "✨", 
      desc: "Short, shining lessons about courage, honesty, and the spark within all beings.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "#", 
      title: "Mythic Tales", 
      glyph: "🐣", 
      desc: "Gentle adventures through ancient lands and kind heroes who follow the Light.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "#", 
      title: "Afterlife for Kids", 
      glyph: "🌙", 
      desc: "Soft, comforting explanations about what happens after life — told with warmth and wonder.",
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Pillar Aesthetic Settings ===
  showLens: false,
  showSeriesNav: false
};

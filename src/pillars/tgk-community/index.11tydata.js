export default {
  layout: "base.njk",
  pillar: "tgk-community",
  title: "TGK Community",
  description:
    "A gathering place for seekers of The Gnostic Key — a living circle of discussion, study, and shared insight.",
  glyph: "💬",
  bodyClass: "community",
  accent: "community",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "tgk-community"],

  // === Header Glyph Row ===
  glyphRow: ["💬", "📚", "🎥"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" }
  ],

  // === Community Sections ===
  pillarGrid: [
    { 
      href: "#", 
      title: "Forums for the Initiated", 
      glyph: "💬", 
      desc: "Discussion boards for seekers and initiates — a space to share insights and interpretations.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "#", 
      title: "Study Circles", 
      glyph: "📚", 
      desc: "Small group readings and decodings of scrolls — learning through shared discovery.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "#", 
      title: "Live Sessions", 
      glyph: "🎥", 
      desc: "Talks, Q&A, and digital rituals — gathering the community in real time.",
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Pillar Aesthetic Settings ===
  showLens: false,
  showSeriesNav: false
};

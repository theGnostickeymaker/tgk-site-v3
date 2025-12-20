export default {
  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-obsidian-key",
  permalink: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Obsidian Key | TGK Community",

  tagline: "Discussion spaces aligned to The Obsidian Key pillar.",

  description:
    "Community discussion hubs for The Obsidian Key pillar, structured to mirror its investigations into power, law, empire, extraction, and systemic injustice.",

  glyph: "🜂",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "The Obsidian Key" }
  ],

  // === Obsidian Key Discussion Gates ===
  topicGrid: [
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/discussion/",
      title: "The Obsidian Key (Pillar Discussion)",
      glyph: "🜂",
      desc:
        "Pillar-level discussion examining power, law, extraction, empire, and systemic injustice across all Obsidian Key investigations.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/",
      title: "House of Grift",
      glyph: "♛",
      desc:
        "Discussion hub for royal theatre, dynastic extraction, and the parasitic bloodlines of empire.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/systemic/",
      title: "SYSTEMIC",
      glyph: "⚖",
      desc:
        "Discussion hub for rights erosion, courtroom alchemy, legislative rituals, and the architecture of modern control.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/empire-codes/",
      title: "Empire Codes",
      glyph: "¤",
      desc:
        "Discussion hub for robber barons, financial occultism, debt sorcery, and imperial continuity.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/tgk-community/threads/topics/the-obsidian-key/gnostic-liberation/",
      title: "Gnostic Liberation",
      glyph: "⨳",
      desc:
        "Discussion hub confronting race, colonisation, class warfare, inherited hierarchy, and the illusions of empire.",
      state: "coming-soon",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

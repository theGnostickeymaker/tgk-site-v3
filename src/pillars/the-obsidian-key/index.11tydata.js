export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-obsidian-key",
  permalink: "/pillars/the-obsidian-key/index.html",

title: "The Gnostic Key | The Obsidian Key | Investigations into Power, Control and Systemic Erosion",

siteTitle: "The Gnostic Key",
pillarTitle: null,
seriesTitle: "The Obsidian Key",
gateTitle: null,

tagline: "Follow the money, decode the myths and the masks",


  description:
    "The investigative and forensic pillar of The Gnostic Key. Deep dives into systems of control, power extraction, corruption, institutional illusion and the hidden machinery behind modern governance and empire.",

  glyph: "✶",
  glyphRow: ["✶", "⚖", "🜃"],
  accent: "obsidian",
  bodyClass: "obsidian",
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Obsidian Key", url: "/pillars/the-obsidian-key/" }
  ],

  // === Pillar Grid: Series Level ===
  pillarGrid: [
    {
      href: "/pillars/the-obsidian-key/house-of-grift/",
      title: "Series I: House of Grift",
      glyph: "♛",
      desc:
        "Royal theatre, dynastic extraction, and the parasitic bloodlines of empire. A forensic journey through entitlement, illusion and public manipulation.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-obsidian-key/systemic/",
      title: "Series II: SYSTEMIC",
      glyph: "⚖",
      desc:
        "Rights erosion, courtroom alchemy, legislative rituals and the architecture of modern control. Mapping injustice at the structural level.",
      state: "active",
      tier: "initiate-trial"
    },
    {
      href: "/pillars/the-obsidian-key/empire-codes/",
      title: "Series IIIEmpire Codes",
      glyph: "¤",
      desc:
        "Robber barons, financial occultism and debt sorcery. Following currency as a mechanism of obedience and imperial continuity.",
      state: "coming-soon",
      tier: "free"
    },
    {
      href: "/pillars/the-obsidian-key/gnostic-liberation/",
      title: "Series V:Gnostic Liberation",
      glyph: "⨳",
      desc:
        "Race, colonisation and class. A spiritual confrontation with whiteness, hierarchy, inherited violence and the illusions of empire.",
      state: "coming-soon",
      tier: "free"
    }
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-obsidian-key/obsidian-index.jpg",

  // === behavior Flags ===
  showLens: true,
  showSeriesNav: false
};

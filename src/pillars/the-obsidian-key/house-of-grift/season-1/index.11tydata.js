export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "hog-season-1",
  permalink:
    "/pillars/the-obsidian-key/house-of-grift/season-1/index.html",

  title:
    "The Gnostic Key | House of Grift | Season I | The Crown Unmasked",
  siteTitle: "The Gnostic Key",

  pillarTitle: "The Obsidian Key",
  seriesTitle: "House of Grift",
  gateTitle: null,
  seasonTitle: "Season I: The Crown Unmasked",

  tagline: "A forensic descent into the parasitic machinery of monarchy",

  description:
    "Season I examines the royal family as a parasitic institution. Each episode reveals the symbolic roles, extraction networks and legitimacy theatre that maintain inherited power.",

  glyph: "♕",
  glyphRow: ["♕", "♛", "⚔"],
  accent: "obsidian",
  bodyClass: "obsidian",
  tier: "free",

  // === Episode Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-obsidian-key/house-of-grift/season-1/ep1-the-british-royals/",
      title: "Episode I: The British Royals",
      glyph: "♛",
      desc: "The monarchy as a parasitic institution. Mapping the extraction engine behind the Crown.",
      state: "active",
      tier: "free"
    },
    {
      href: "/pillars/the-obsidian-key/house-of-grift/season-1/ep2-the-protected-predator/",
      title: "Episode II: Prince Andrew",
      glyph: "♛",
      desc: "A forensic dissection of institutional shielding.",
      state: "active",
      tier: "verified"
    },
    {
      href: "/pillars/the-obsidian-key/house-of-grift/season-1/ep3-princess-beatrice/",
      title: "Episode III: Princess Beatrice",
      glyph: "♛",
      desc: "A symbolic and financial autopsy of the hidden roles played by minor royals.",
      state: "active",
      tier: "verified"
    },
  ],

  // === Social Meta ===
  socialImage:
    "/tgk-assets/images/share/the-obsidian-key/hog-season-1.jpg",

  // === behavior Flags ===
  showLens: false,
  showSeriesNav: true
};

export default {

  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "community-house-of-grift-season-1",
  permalink:
    "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/discussion/index.html",

  siteTitle: "The Gnostic Key",
  title: "House of Grift — Season I | TGK Community",

  tagline: "Discussion spaces aligned to Season I of House of Grift.",

  description:
    "Community discussion hubs for Season I of House of Grift, structured to mirror its investigative episodes and expose recurring patterns of entitlement, protection, and extraction.",

  glyph: "♛",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    {
      title: "The Obsidian Key",
      url: "/pillars/tgk-community/threads/topics/the-obsidian-key/"
    },
    {
      title: "House of Grift",
      url: "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/"
    },
    { title: "Season I" }
  ],

  // === Season I Discussion Gates ===
  topicGrid: [

    // === Season-level discussion ===
    {
      href:
        "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/discussion/",
      title: "Season I — Series Discussion",
      glyph: "♛",
      desc:
        "Cross-episode discussion of Season I as a whole, examining patterns of royal entitlement, institutional shielding, and extraction.",
      state: "active",
      tier: "free"
    },

    // === Episode-level discussions ===
    {
      href:
        "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep1-the-british-royals/",
      title: "Episode I: The British Royals",
      glyph: "♛",
      desc:
        "The monarchy as an extraction engine. Mapping entitlement, theatre, and protected power.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep2-the-protected-predator/",
      title: "Episode II: The Protected Predator",
      glyph: "♛",
      desc:
        "A forensic examination of institutional shielding and reputational containment.",
      state: "active",
      tier: "free"
    },
    {
      href:
        "/pillars/tgk-community/threads/topics/the-obsidian-key/house-of-grift/season-1/ep3-princess-beatrice/",
      title: "Episode III: Princess Beatrice",
      glyph: "♛",
      desc:
        "A symbolic and financial autopsy of the hidden roles played by minor royals.",
      state: "active",
      tier: "free"
    }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",

  // Core identity
  suppressPageTitle: true,

  pageId: "community-final-idol-hub",
  permalink:
    "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/discussion/index.html",

  siteTitle: "The Gnostic Key",
  title: "The Final Idol | TGK Community",

  tagline: "One hub for discussion threads connected to The Final Idol series.",
  description:
    "Community discussion hub for The Final Idol (Gnostic Eye), tracking techno-religion, machine worship, narrative spellcraft, and refusal as a practice.",

  glyph: "👁",
  glyphRow: ["✦", "☉", "✦"],
  accent: "community",
  bodyClass: "community",
  tier: "free",

  // Breadcrumbs
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Community", url: "/pillars/tgk-community/" },
    { title: "Community Threads", url: "/pillars/tgk-community/threads/" },
    {
      title: "The Gnostic Eye",
      url: "/pillars/tgk-community/threads/topics/the-gnostic-eye/"
    },
    {
      title: "The Final Idol",
      url: "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/"
    }
  ],

  // Hub cards
  threads: [
    {
      title: "Series I Thread",
      description:
        "Single discussion thread for the entire Series I run (all scrolls and themes).",
      url:
        "/pillars/tgk-community/threads/topics/the-gnostic-eye/the-final-idol/series-1/"
    }
  ]
};

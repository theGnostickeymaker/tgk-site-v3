import site from "./_data/site.js";

export default {
  layout: "base.njk",

  // === Core Identity ===
  suppressPageTitle: true,

  pageId: "home",
  permalink: "/index.html",
  title: "The Gnostic Key | Exposing Hidden Power, Restoring Memory and Reclaiming Human Sovereignty",

  siteTitle: "The Gnostic Key",
  tagline: "Where the erased, the forbidden, and the sacred converge.",

  description:
    "Where the erased, the forbidden, and the sacred converge — a sanctuary of pages across traditions, investigations, archetypes, and vaults of hidden memory.",

  glyph: "𓂀",
  glyphRow: ["☉", "🜂", "☿", "✷"],
  accent: "lightgold",
  bodyClass: "home",
  tier: "free",

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" }
  ],

  // === Pillar Overview Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-teachings/",
      title: "The Teachings",
      glyph: "✶",
      desc: "Accessible pages, glossaries, and guides for seekers of all paths.",
      tier: "initiate-trial",
      state: "default"
    },
    {
      href: "/pillars/the-obsidian-key/",
      title: "The Obsidian Key",
      glyph: "🜂",
      desc: "Deep-dive investigations into power, law, and empire.",
      tier: "initiate-trial",
      state: "default"
    },
    {
      href: "/pillars/the-gnostic-eye/",
      title: "The Gnostic Eye",
      glyph: "☿",
      desc: "Symbolic and archetypal analysis of modern and mythic events.",
      tier: "initiate-trial",
      state: "default"
    },
    {
      href: "/pillars/the-vault/",
      title: "The Vault",
      glyph: "🗄️",
      desc: "Preserved forbidden and sacred texts — the erased memory of humanity.",
      tier: "initiate-trial",
      state: "default"
    },
    {
      href: "/pillars/the-resonant-key/",
      title: "The Resonant Key",
      glyph: "🎧",
      desc: "Audiobooks, sound rituals, and immersive journeys.",
      tier: "initiate-trial",
      state: "coming-soon"
    },
    {
      href: "/pillars/childrens-corner/",
      title: "Children’s Corner",
      glyph: "🧸",
      desc: "Gentle stories and parables for young seekers.",
      tier: "initiate-trial",
      state: "coming-soon"
    },
    {
      href: "/pillars/tgk-community/",
      title: "TGK Community",
      glyph: "💬",
      desc: "Forums, study circles, and live sessions.",
      tier: "initiate-trial",
      state: "coming-soon"
    },
    {
      href: "/pillars/tgk-shop/",
      title: "TGK Shop",
      glyph: "🛍️",
      desc: "Artefacts, decks, prints, and collector editions.",
      tier: "initiate-trial",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-keymakers-dream/",
      title: "The Keymaker’s Dream",
      glyph: "🗝️",
      desc: "A personal Gnostic memoir — the dream that made the lock.",
      tier: "initiate-trial",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-gnostic-key/index.jpg",

  // === behavior Flags ===
  showLens: false,
  showSeriesNav: false
};

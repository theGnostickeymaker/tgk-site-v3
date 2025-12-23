export default {
  layout: "base.njk",
  pillar: "the-forge",

  title: "The Forge",
  description:
    "A creator gateway for founder work, guest essays, investigations, and collaborative releases. A home for work that must be tested, refined, and made real.",
  glyph: "🗝️",
  bodyClass: "forge",
  accent: "forge",
  tier: "free",

  tags: ["pillar", "the-forge"],

  glyphRow: ["🗝️", "🜂", "⚯"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Forge", url: "/pillars/the-forge/" }
  ],

  pillarGrid: [
    {
      href: "/pillars/the-forge/founder-work/",
      title: "Founder Work",
      glyph: "🜏",
      desc: "The Keymaker’s Dream, memoir fragments, and symbolic autobiography.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-forge/guest-essays/",
      title: "Guest Essays",
      glyph: "✍️",
      desc: "External writers and thinkers publishing inside TGK’s ecosystem.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-forge/investigations/",
      title: "Collaborative Investigations",
      glyph: "🧾",
      desc: "Multi-voice investigations, dossiers, and evidence-led submissions.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-forge/publishing-hubs/",
      title: "Publishing Hubs",
      glyph: "⚯",
      desc: "Dedicated discussion halls for authors, with structured critique and reader dialogue.",
      tier: "initiate-trial",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-forge/submit/",
      title: "Submit Work",
      glyph: "📬",
      desc: "Bring a piece to the Forge, essays, art, audio, and investigations.",
      tier: "free",
      state: "coming-soon"
    }
  ],

  synergistLens: {
    crossLinks: [
      {
        title: "TGK Community",
        path: "/pillars/tgk-community/",
        desc: "Debate halls and discussion threads, including author hubs and structured critique."
      },
      {
        title: "TGK Shop",
        path: "/pillars/tgk-shop/",
        desc: "Artefacts, prints, editions, and creator merchandise tied to released works."
      }
    ]
  },

  showLens: true,
  showSeriesNav: false
};

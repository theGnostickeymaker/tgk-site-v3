export default {
  // 🕍 Pillar Identity
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/pillars/the-teachings/",
  pillarGlyph: "⛪︎",
  accent: "gold",
  tier: "free", 

  // 🌍 Pillar Overview Grid
  pillarGrid: [
    {
      href: "/pillars/the-teachings/the-afterlife/",
      title: "The Afterlife Series",
      glyph: "☥",
      desc: "Maps of death, rebirth, and remembrance across traditions.",
      tier: "initiate-trial",
      state: "active"
    },
    {
      href: "#",
      title: "Know Your Rights",
      glyph: "⚖",
      desc: "Scrolls of civil liberty, law, and self-defence.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "#",
      title: "Sacred Pedagogy",
      glyph: "📜",
      desc: "Teachings and exercises for initiates of truth.",
      tier: "initiate",
      state: "coming-soon"
    }
  ],

  // 🧭 Computed Data for Dynamic Layouts
  eleventyComputed: {
    breadcrumbs: () => [
      { title: "The Gnostic Key", url: "/" },
      { title: "The Teachings", url: "/pillars/the-teachings/" }
    ]
  }
};

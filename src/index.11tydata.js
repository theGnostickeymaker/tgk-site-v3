export default {
  eleventyComputed: {

    pillarGrid: () => ([  // no "()" needed but fine if present
      { href: "/pillars/the-teachings/",     title: "The Teachings",     glyph: "✶", tagline: "Accessible scrolls, glossaries, and guides." },
      { href: "/pillars/the-obsidian-key/",  title: "The Obsidian Key",  glyph: "🜂", tagline: "Deep-dive investigations into power." },
      { href: "/pillars/the-gnostic-eye/",   title: "The Gnostic Eye",   glyph: "☿", tagline: "Symbolic & archetypal analysis." },
      { href: "/pillars/the-vault/",         title: "The Vault",         glyph: "🗄️", tagline: "Preserved forbidden and sacred texts.", state: "premium" },
      { href: "/pillars/the-resonant-key/",  title: "The Resonant Key",  glyph: "🎵", tagline: "Audiobooks & sound rituals.", state: "soon" },
      { href: "/pillars/childrens-corner/",  title: "Children’s Corner", glyph: "🧸", tagline: "Gentle stories for young seekers.", state: "soon" },
      { href: "/pillars/tgk-community/",     title: "TGK Community",     glyph: "💬", tagline: "Forums, circles, live sessions.", state: "soon" },
      { href: "/pillars/tgk-shop/",          title: "TGK Shop",          glyph: "🛍️", tagline: "Artefacts & limited editions.", state: "soon" },
      { href: "/pillars/the-keymakers-dream/", title: "The Keymaker’s Dream", glyph: "🗝️", tagline: "Personal Gnostic memoir.", state: "soon" }
    ])
  }
};

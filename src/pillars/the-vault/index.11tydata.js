export default {
  eleventyComputed: {
    pillarGrid: () => ([
      { href: "/pillars/the-vault/codex-reborn/",            title: "Codex Reborn",            glyph: "📜", tagline: "Nag Hammadi & Gnostic gospels.", state: "premium" },
      { href: "/pillars/the-vault/mystical-traditions/",     title: "Mystical Traditions",     glyph: "✡️", tagline: "Buddhism, Kabbalah, Sufism, Egypt.", state: "premium" },
      { href: "/pillars/the-vault/forbidden-documents/",     title: "Forbidden Documents",     glyph: "🚫", tagline: "Erased histories, banned books.", state: "premium" }
    ])
  }
};

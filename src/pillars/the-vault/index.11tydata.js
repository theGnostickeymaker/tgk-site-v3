export default {
  eleventyComputed: {
    pillarGrid: () => ([
      { href: "/pillars/the-vault/codex-reborn/",            title: "Codex Reborn",            glyph: "📜", tagline: "Nag Hammadi & Gnostic gospels.", tier: "free", state: "default" },
      { href: "/pillars/the-vault/mystical-traditions/",     title: "Mystical Traditions",     glyph: "✡️", tagline: "Buddhism, Kabbalah, Sufism, Egypt.", tier: "free", state: "default" },
      { href: "/pillars/the-vault/forbidden-documents/",     title: "Forbidden Documents",     glyph: "🚫", tagline: "Erased histories, banned books.", tier: "free", state: "default" }
    ])
  }
};

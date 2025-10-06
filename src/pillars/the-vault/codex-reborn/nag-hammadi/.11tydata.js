// src/pillars/the-vault/codex-reborn/nag-hammadi/.11tydata.js
export default {
  eleventyComputed: {
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Nag Hammadi Library",
    accent: () => "vault",
    glyphRow: () => ["📜", "🕯", "📜"],
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" }
    ])
  }
};

export default {
  eleventyComputed: {
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Nag Hammadi – Codex V",
    accent: () => "vault",
    glyphRow: () => ["📜", "🕯", "📜"],
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
      { title: "Codex V", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/" }
    ])
  }
};

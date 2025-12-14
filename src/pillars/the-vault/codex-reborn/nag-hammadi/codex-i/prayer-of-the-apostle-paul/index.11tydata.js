export default {
  layout: "base.njk",

  // === Unified Header Hierarchy ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: "Codex Reborn",
  seriesTitle: "Nag Hammadi – Codex I",
  episodeTitle: "Prayer of the Apostle Paul",
  seasonTitle: null,
  partTitle: null,

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-i-prayer-of-the-apostle-paul",
  permalink:
    "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/prayer-of-the-apostle-paul/index.html",

  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-i",

  title: "Prayer of the Apostle Paul",
  description:
    "A brief invocation to the Redeemer, the opening text of Codex I, expressing the soul’s yearning for reunion with the Divine Mind.",
  tagline: "Invocation ✦ Remembrance ✦ Return",

  glyph: "🕊",
  glyphRow: ["🜂", "🕊", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: [
    "pillar",
    "the-vault",
    "codex-reborn",
    "nag-hammadi",
    "codex-i",
    "prayer-of-the-apostle-paul"
  ],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex I", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/" },
    { title: "Prayer of the Apostle Paul" } // no URL on final item
  ],

  // === Vault References ===
  vaultRefs: [
    {
      title: "Prayer of the Apostle Paul — Firebase Vault",
      href:
        "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.appspot.com/o/vault%2Fnag-hammadi%2Fprayer-of-the-apostle-paul.pdf?alt=media",
      type: "pdf"
    }
  ],

  // === Social Image ===
  socialImage:
    "/tgk-assets/images/share/the-vault/codex-reborn/nag-hammadi/prayer-of-the-apostle-paul.jpg",

  // === behavior ===
  showLens: false,
  showSeriesNav: false
};

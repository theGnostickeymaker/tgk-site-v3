export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn",
  permalink: "/pillars/the-vault/codex-reborn/index.html",

  // === Unified Header Hierarchy (used by base.njk) ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: null,
  seriesTitle: "Codex Reborn",
  seasonTitle: null,
  episodeTitle: null,
  partTitle: null,

  // === Display Metadata ===
  title: "Codex Reborn",
  tagline: "Recovered pages ✦ Hidden revelations ✦ The voice of Sophia",
  description:
    "Recovered Gnostic gospels and apocrypha preserved within The Vault. A sanctuary of forbidden, forgotten, and resurrected writings.",

  // === Pillar Metadata ===
  pillarId: "the-vault",
  pillarName: "The Vault",
  pillarUrl: "/pillars/the-vault/",

  pillarGlyph: "🜔",
  glyph: "📜",
  glyphRow: ["🜔", "📜", "🜔"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  // === Intro Text ===
  introText:
    "Codex Reborn restores the Gnostic gospels and apocryphal writings buried, banned, or silenced throughout history. These texts reveal the hidden teachings of Christ, Sophia’s descent, and the architecture of the soul.",

  // === Collection Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/",
      title: "Nag Hammadi Library",
      glyph: "📜",
      tagline:
        "Thirteen codices uncovered in 1945 that reshaped the understanding of early Christianity.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/",
      title: "Berlin Codex",
      glyph: "📜",
      tagline:
        "The Coptic codex containing the Gospel of Mary and texts of the hidden Christ.",
      tier: "free",
      state: "active"
    },
    {
      href: "/pillars/the-vault/codex-reborn/codex-tchacos/",
      title: "Codex Tchacos",
      glyph: "📜",
      tagline:
        "Home of the Gospel of Judas, a radical revelation of the Passion.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/codex-reborn/biblical-apocrypha/",
      title: "Biblical Apocrypha",
      glyph: "📜",
      tagline:
        "Apocryphal writings that blurred the line between canon, memory, and heresy.",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/codex-reborn/independent-texts/",
      title: "Independent Texts",
      glyph: "📜",
      tagline:
        "Revelations and fragments that survived outside the major codices.",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Metadata ===
  socialImage: "/tgk-assets/images/share/the-vault/codex-reborn.jpg",
  ogTitle: "Codex Reborn — Recovered Gnostic Gospels",
  ogDescription:
    "Explore the restored Gnostic gospels and apocryphal writings preserved in The Vault.",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" }
  ],

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

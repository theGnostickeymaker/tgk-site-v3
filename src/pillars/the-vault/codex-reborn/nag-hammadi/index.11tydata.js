// /src/pillars/the-vault/codex-reborn/nag-hammadi/index.11tydata.js
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi",
  permalink: "/pillars/the-vault/codex-reborn/nag-hammadi/index.html",
  pillar: "the-vault",
  series: "codex-reborn",
  title: "Nag Hammadi Library",
  description:
    "Thirteen Coptic codices uncovered in 1945 — the foundation of modern Gnostic scripture.",
  tagline: "Hidden texts ✦ Sophia’s wisdom ✦ Gnostic origins",
  glyph: "📜",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi"],
  tier: "free",

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" }
  ],

  // === Series Intro ===
  seriesIntro:
    "The Nag Hammadi Library — discovered in 1945 near the Egyptian town of Nag Hammadi — contains thirteen codices holding over fifty Gnostic treatises, revealing Sophia’s descent, the false creator, and the soul’s divine return.",

  // === Subcollection Grid ===
  pillarGrid: [
    {
      title: "Codex I – The Jung Codex",
      desc: "Containing the Prayer of the Apostle Paul and the Apocryphon of James.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex II",
      desc: "Includes the Gospel of Thomas, the Apocryphon of John, and the Gospel of Philip.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex III",
      desc: "Featuring the Gospel of the Egyptians and Eugnostos the Blessed.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Codex V",
      desc: "Home to the Apocalypse of Adam and the Revelation of Paul.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex VII",
      desc: "Containing the Second Treatise of the Great Seth and the Three Steles of Seth.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/",
      glyph: "📜",
      tier: "free",
      state: "default"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

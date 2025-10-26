// /src/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/index.11tydata.js
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-ii",
  permalink: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/index.html",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",

  title: "Nag Hammadi – Codex II",
  description:
    "The most renowned of the Nag Hammadi volumes, containing the Gospel of Thomas, Apocryphon of John, and other foundational Gnostic revelations.",
  tagline: "The Heart of Nag Hammadi ✦ Thomas ✦ Philip ✦ The Archons Unveiled",

  glyph: "📜",
  glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-ii"],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" }
  ],

  // === Subcollection Grid — Texts within Codex II ===
  pillarGrid: [
    {
      title: "Apocryphon of John",
      desc: "A revelation of the true origins of the cosmos, spoken by the risen Christ to John — the cornerstone of Gnostic cosmology.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/apocryphon-of-john/text/",
      glyph: "🜂",
      tier: "free",
      state: "default"
    },
    {
      title: "Gospel of Thomas",
      desc: "114 sayings of Jesus revealing the hidden knowledge within — the kingdom within and without.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-thomas/text/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Gospel of Philip",
      desc: "Teachings on unity, illusion, and the bridal chamber — unveiling mystical sacrament and self-knowledge.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/gospel-of-philip/text/",
      glyph: "🕯",
      tier: "free",
      state: "default"
    },
    {
      title: "Hypostasis of the Archons",
      desc: "A mythic commentary on Genesis revealing the rulers who formed the false world and the spirit’s path of defiance.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/hypostasis-of-the-archons/text/",
      glyph: "💀",
      tier: "free",
      state: "default"
    },
    {
      title: "On the Origin of the World",
      desc: "A cosmic retelling of creation, exposing the powers that shaped matter and the light that redeems it.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/on-the-origin-of-the-world/text/",
      glyph: "🜁",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Exegesis on the Soul",
      desc: "An allegory of the fallen and redeemed soul, ending Codex II with the mystery of spiritual marriage.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/exegesis-on-the-soul/text/",
      glyph: "🕊",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi-codex-ii.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

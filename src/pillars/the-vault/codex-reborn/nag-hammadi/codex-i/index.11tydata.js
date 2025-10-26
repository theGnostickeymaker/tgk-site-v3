// /src/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/index.11tydata.js
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-i",
  permalink: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/index.html",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-i",
  title: "Nag Hammadi – Codex I",
  description:
    "Contains key Gnostic writings such as the Gospel of Truth — the revelation of self-knowledge and return to the Father.",
  tagline: "The Jung Codex ✦ The Gospel of Truth ✦ The Light Returned",
  glyph: "📜",
  glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-i"],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex I", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/" }
  ],

  // === Subcollection Grid (Texts within Codex I) ===
  pillarGrid: [
    {
      title: "Gospel of Truth",
      desc: "A poetic meditation attributed to Valentinus — the good news of self-knowledge and the return to the Father.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/gospel-of-truth/text/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Tripartite Tractate",
      desc: "A grand cosmological narrative describing emanation, fall, and restoration within the divine Fullness.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/tripartite-tractate/text/",
      glyph: "🕯",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Treatise on the Resurrection",
      desc: "A letter on spiritual rebirth and the awakening of the inner man, attributed to Rheginos.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/treatise-on-the-resurrection/text/",
      glyph: "🜂",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Prayer of the Apostle Paul",
      desc: "A short invocation to the Redeemer, placed at the opening of Codex I.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/prayer-of-the-apostle-paul/text/",
      glyph: "🕊",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Apocryphon of James",
      desc: "Secret teachings of Jesus to James the Just, exploring the mystery of suffering and salvation.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/apocryphon-of-james/text/",
      glyph: "🌿",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi-codex-i.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

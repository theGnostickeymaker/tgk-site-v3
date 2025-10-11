export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-i",
  title: "Nag Hammadi – Codex I",
  description: "Contains key Gnostic writings such as the Gospel of Truth — the revelation of self-knowledge and return to the Father.",
  glyph: "📜",
  bodyClass: "vault",

  // === Accent & Tagging ===
  accent: "vault",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-i"],

  // === Header Glyph Row ===
  glyphRow: ["📜", "🕯", "📜"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex I", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/" }
  ],

  // === Texts within Codex I ===
  pillarGrid: [
    {
      title: "Gospel of Truth",
      desc: "A poetic meditation attributed to Valentinus — the good news of self-knowledge and the return to the Father.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/gospel-of-truth/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Tripartite Tractate",
      desc: "A grand cosmological narrative describing emanation, fall, and restoration within the divine Fullness.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/tripartite-tractate/",
      glyph: "🕯",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Treatise on the Resurrection",
      desc: "A letter on spiritual rebirth and the awakening of the inner man, attributed to Rheginos.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/treatise-on-the-resurrection/",
      glyph: "🜂",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Prayer of the Apostle Paul",
      desc: "A short invocation to the Redeemer, placed at the opening of Codex I.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/prayer-of-the-apostle-paul/",
      glyph: "🕊",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Apocryphon of James",
      desc: "Secret teachings of Jesus to James the Just, exploring the mystery of suffering and salvation.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/apocryphon-of-james/",
      glyph: "🌿",
      tier: "initiate",
      state: "coming-soon"
    }
  ]
};

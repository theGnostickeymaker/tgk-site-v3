// /src/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/index.11tydata.js
export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-v",

  // === Core Identity ===
  title: "Nag Hammadi – Codex V",
  description:
    "Codex V preserves visionary and apocalyptic revelations — the journeys of Paul and James through the heavens, Adam’s secret testament, and a cosmological fragment echoing the Origin of the World.",
  tagline: "Revelation ✦ Ascent ✦ The Soul’s Trial",

  glyph: "📜",
  glyphRow: ["📜", "🕯", "📜"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-v"],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex V", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/" }
  ],

  // === Subcollection Grid (Texts within Codex V) ===
  pillarGrid: [
    {
      title: "Apocalypse of Paul",
      desc: "Paul’s visionary ascent through the heavens — toll gates, interrogators, and the soul’s liberation through the secret sign.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-paul/",
      glyph: "🜂",
      tier: "free",
      state: "default"
    },
    {
      title: "First Apocalypse of James",
      desc: "A revelation of the risen Christ to James — teaching fearlessness before the archons and the mystery of redemption.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/first-apocalypse-of-james/",
      glyph: "🕯",
      tier: "free",
      state: "default"
    },
    {
      title: "Second Apocalypse of James",
      desc: "James receives hidden instructions for the soul’s ascent beyond the rulers of the world — the secret passwords of deliverance.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/second-apocalypse-of-james/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Apocalypse of Adam",
      desc: "The primeval testament of Adam — revealing the fall of light and the coming redemption of his seed.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-adam/",
      glyph: "💧",
      tier: "free",
      state: "default"
    },
    {
      title: "Fragment on the Origin of the World (Codex V Variant)",
      desc: "A fragmentary retelling of the cosmic myth paralleling Codex II — differing in tone and detail.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/origin-fragment/",
      glyph: "🜁",
      tier: "free",
      state: "default"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi-codex-v.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

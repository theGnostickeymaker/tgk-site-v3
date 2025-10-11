export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-v",
  title: "Nag Hammadi – Codex V",
  description:
    "Codex V preserves visionary and apocalyptic revelations — the journeys of Paul and James through the heavens, Adam’s secret testament, and a cosmological fragment echoing the Origin of the World.",
  glyph: "📜",
  bodyClass: "vault",
  accent: "vault",

  // === Tier & Tagging ===
  tier: "initiate",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-v"],

  // === Header Glyph Row ===
  glyphRow: ["📜", "🕯", "📜"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex V", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/" }
  ],

  // === Texts within Codex V ===
  pillarGrid: [
    {
      title: "Apocalypse of Paul",
      desc: "Paul’s visionary ascent through the heavens — toll gates, interrogators, and the soul’s liberation through the secret sign.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-paul/",
      glyph: "🜂",
      tier: "initiate",
      state: "default"
    },
    {
      title: "First Apocalypse of James",
      desc: "A revelation of the risen Christ to James — teaching fearlessness before the archons and the mystery of redemption.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/first-apocalypse-of-james/",
      glyph: "🕯",
      tier: "initiate",
      state: "default"
    },
    {
      title: "Second Apocalypse of James",
      desc: "James receives hidden instructions for the soul’s ascent beyond the rulers of the world — the secret passwords of deliverance.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/second-apocalypse-of-james/",
      glyph: "📜",
      tier: "adept",
      state: "default"
    },
    {
      title: "Apocalypse of Adam",
      desc: "The primeval testament of Adam — a revelation of the coming flood and the knowledge of the true Light.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/apocalypse-of-adam/",
      glyph: "💧",
      tier: "adept",
      state: "default"
    },
    {
      title: "Fragment on the Origin of the World (Codex V Variant)",
      desc: "A fragmentary retelling of the cosmic myth paralleling Codex II — differing in tone and theological nuance.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/origin-fragment/",
      glyph: "🜁",
      tier: "initiate",
      state: "coming-soon"
    }
  ]
};

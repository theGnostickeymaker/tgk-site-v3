export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  title: "Nag Hammadi Library",
  description: "Thirteen ancient Gnostic codices discovered in 1945 — the hidden gospels of Sophia and the Light.",
  glyph: "📜",
  bodyClass: "vault",

  // === Accent & Tagging ===
  accent: "vault",
  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi"],

  // === Header Glyph Row ===
  glyphRow: ["📜", "🕯", "📜"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" }
  ],

  // === Codex Cards (I–XIII) ===
  pillarGrid: [
    {
      title: "Codex I",
      desc: "Contains the Prayer of the Apostle Paul and the Apocryphon of James.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-i/",
      glyph: "📖",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex II",
      desc: "Houses foundational texts including the Gospel of Thomas and the Apocryphon of John.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/",
      glyph: "📖",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex III",
      desc: "Texts such as the Gospel of the Egyptians and Eugnostos the Blessed.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/",
      glyph: "📖",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Codex IV",
      desc: "Parallel versions and continuations of Codex II texts.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iv/",
      glyph: "📖",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Codex V",
      desc: "Includes the Apocalypse of Paul and the First Apocalypse of James.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-v/",
      glyph: "📖",
      tier: "initiate",
      state: "default"
    },
    {
      title: "Codex VI",
      desc: "Works on soul, mind, and resurrection.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vi/",
      glyph: "📖",
      tier: "initiate",
      state: "coming-soon"
    },
    {
      title: "Codex VII",
      desc: "Includes the Second Treatise of the Great Seth and the Apocalypse of Peter.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-vii/",
      glyph: "📖",
      tier: "full",
      state: "default"
    },
    {
      title: "Codex VIII",
      desc: "Hermetic and cosmological texts.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-viii/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    },
    {
      title: "Codex IX",
      desc: "Revelations of Melchizedek and related works.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ix/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    },
    {
      title: "Codex X",
      desc: "Damaged but significant fragmentary material.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-x/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    },
    {
      title: "Codex XI",
      desc: "Teachings on cosmic ascent and revelation.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-xi/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    },
    {
      title: "Codex XII",
      desc: "Short moral treatises and psalms of illumination.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-xii/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    },
    {
      title: "Codex XIII",
      desc: "Fragment containing the Trimorphic Protennoia — voice of the Divine Mind.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-xiii/",
      glyph: "📖",
      tier: "full",
      state: "coming-soon"
    }
  ]
};

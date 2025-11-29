// /src/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/index.11tydata.js
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-iii",
  permalink: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/index.html",

  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-iii",

  // === Unified Header Hierarchy ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: "Codex Reborn",
  seriesTitle: "Nag Hammadi – Codex III",
  seasonTitle: null,
  episodeTitle: null,
  partTitle: null,

  // === Display ===
  title: "Nag Hammadi – Codex III",
  description:
    "Codex III contains three major visionary treatises of cosmic revelation, including The Gospel of the Egyptians and Eugnostos the Blessed.",
  tagline: "Aeons ✦ Revelation ✦ The Luminous Mind",

  glyph: "🜂",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  tags: ["pillar", "the-vault", "codex-reborn", "nag-hammadi", "codex-iii"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex III", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/" }
  ],

  // === Intro Summary ===
  seriesIntro:
    "Codex III of the Nag Hammadi Library unites three visionary texts describing the emanations of the divine, the cosmos, and the restoration of the soul through hidden wisdom.",

  // === Subcollection Grid (Texts within Codex III) ===
  pillarGrid: [
    {
      title: "The Gospel of the Egyptians",
      desc: "A cosmic hymn to the Great Invisible Spirit and the aeons of divine light.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/gospel-of-the-egyptians/text/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Eugnostos the Blessed",
      desc: "A revelation of the structure of reality and the luminous aeons of the Pleroma.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/eugnostos-the-blessed/text/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "The Sophia of Jesus Christ",
      desc: "A dialogue between Christ and his disciples unveiling the origin of creation and the path of return.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-iii/sophia-of-jesus-christ/text/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/nag-hammadi-codex-iii.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

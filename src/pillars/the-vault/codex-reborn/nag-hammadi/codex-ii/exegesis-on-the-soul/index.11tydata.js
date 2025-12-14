export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn-nag-hammadi-codex-ii-exegesis-on-the-soul",
  permalink:
    "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/exegesis-on-the-soul/index.html",

  pillar: "the-vault",
  series: "codex-reborn",
  collection: "nag-hammadi",
  codex: "codex-ii",

  // === Unified Header Hierarchy ===
  siteTitle: "The Gnostic Key",
  pillarTitle: "The Vault",
  gateTitle: "Codex Reborn",
  seriesTitle: "Nag Hammadi – Codex II",
  episodeTitle: "Exegesis on the Soul",
  seasonTitle: null,
  partTitle: null,

  // === Display ===
  title: "Exegesis on the Soul",
  description:
    "An allegory of the fallen and redeemed soul, exploring repentance, purification, and reunion with the divine Bridegroom.",
  tagline: "Fall ✦ Purification ✦ Reunion",

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
    "codex-ii",
    "exegesis-on-the-soul"
  ],

  // === Breadcrumbs ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
    { title: "Nag Hammadi Library", url: "/pillars/the-vault/codex-reborn/nag-hammadi/" },
    { title: "Codex II", url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/" },
    {
      title: "Exegesis on the Soul",
      url: "/pillars/the-vault/codex-reborn/nag-hammadi/codex-ii/exegesis-on-the-soul/"
    }
  ],

  // === Vault References ===
  vaultRefs: [
    {
      title: "Exegesis on the Soul — Firebase Vault",
      href:
        "https://firebasestorage.googleapis.com/v0/b/the-gnostic-key.appspot.com/o/vault%2Fnag-hammadi%2Fexegesis-on-the-soul.pdf?alt=media",
      type: "pdf"
    }
  ],

  // === Social Image ===
  socialImage:
    "/tgk-assets/images/share/the-vault/nag-hammadi-exegesis-on-the-soul.jpg",

  // === behavior Flags ===
  showLens: false,
  showSeriesNav: false
};

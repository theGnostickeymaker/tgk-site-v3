// /src/pillars/the-vault/codex-reborn/index.11tydata.js
export default {
  layout: "base.njk",

  // === Core Identity ===
  pageId: "the-vault-codex-reborn",
  permalink: "/pillars/the-vault/codex-reborn/index.html",
  pillarId: "the-vault",
  title: "Codex Reborn",
  description:
    "Recovered Gnostic gospels and apocrypha — preserved fragments of the ancient light.",
  tagline: "Recovered pages ✦ hidden revelations ✦ the voice of Sophia",
  glyph: "📜",
  glyphRow: ["🜂", "🕯", "🜂"],
  accent: "vault",
  bodyClass: "vault",
  tier: "free",

  // === Breadcrumbs (required by header partial) ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" }
  ],

  // === Subcollection Grid ===
  pillarGrid: [
    {
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/",
      title: "Nag Hammadi Library",
      desc: "Thirteen codices uncovered in 1945 — the foundation of Gnostic scripture.",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-vault/codex-reborn/berlin-codex/",
      title: "Berlin Codex",
      desc: "A 4th-century Coptic codex containing the Gospel of Mary and other revelations.",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      href: "/pillars/the-vault/codex-reborn/codex-tchacos/",
      title: "Codex Tchacos",
      desc: "Home of the Gospel of Judas — a radical re-telling of the Passion.",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/codex-reborn/biblical-apocrypha/",
      title: "Biblical Apocrypha",
      desc: "Apocryphal writings that blurred the line between canon and heresy.",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      href: "/pillars/the-vault/codex-reborn/independent-texts/",
      title: "Independent Texts",
      desc: "Fragments and revelations that survived outside the codices.",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ],

  // === Social Meta ===
  socialImage: "/tgk-assets/images/share/the-vault/codex-reborn.jpg",

  // === Behaviour Flags ===
  showLens: false,
  showSeriesNav: false
};

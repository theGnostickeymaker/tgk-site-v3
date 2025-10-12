export default {
  layout: "base.njk",
  pillar: "the-vault",
  series: "codex-reborn",
  title: "Codex Reborn",
  description: "Recovered Gnostic gospels and apocrypha — preserved fragments of the ancient light.",
  glyph: "📜",
  accent: "vault",
  bodyClass: "vault",
  tags: ["pillar", "the-vault", "codex-reborn"],

  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Vault", url: "/pillars/the-vault/" },
    { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" }
  ],

  seriesIntro:
    "Codex Reborn gathers the rediscovered scriptures of Gnosticism — the Nag Hammadi Library, Berlin Codex, and other forbidden texts preserved within the Vault.",

  pillarGrid: [
    {
      title: "Nag Hammadi Library",
      desc: "Thirteen codices uncovered in 1945 — the foundation of Gnostic scripture.",
      href: "/pillars/the-vault/codex-reborn/nag-hammadi/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Berlin Codex",
      desc: "A 4th-century Coptic codex containing the Gospel of Mary and other revelations.",
      href: "/pillars/the-vault/codex-reborn/berlin-codex/",
      glyph: "📜",
      tier: "free",
      state: "default"
    },
    {
      title: "Codex Tchacos",
      desc: "Home of the Gospel of Judas — a radical re-telling of the Passion.",
      href: "/pillars/the-vault/codex-reborn/codex-tchacos/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Biblical Apocrypha",
      desc: "Apocryphal writings that blurred the line between canon and heresy.",
      href: "/pillars/the-vault/codex-reborn/biblical-apocrypha/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    },
    {
      title: "Independent Texts",
      desc: "Fragments and revelations that survived outside the codices.",
      href: "/pillars/the-vault/codex-reborn/independent-texts/",
      glyph: "📜",
      tier: "free",
      state: "coming-soon"
    }
  ]
};

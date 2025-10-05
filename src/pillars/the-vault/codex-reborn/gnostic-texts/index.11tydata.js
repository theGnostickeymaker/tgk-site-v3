export default {
  eleventyComputed: {
    // 🜂 Pillar Metadata
    pillarId: () => "the-vault",
    pillarName: () => "The Vault",
    pillarUrl: () => "/pillars/the-vault/",
    series: () => "codex-reborn",
    seriesLabel: () => "Codex Reborn",
    pillarGlyph: () => "🜂",
    accent: () => "vault",
    glyphRow: () => ["🜂", "🕯", "🜂"],

    // 🧭 Breadcrumb Trail
    breadcrumbs: () => ([
      { title: "The Gnostic Key", url: "/" },
      { title: "The Vault", url: "/pillars/the-vault/" },
      { title: "Codex Reborn", url: "/pillars/the-vault/codex-reborn/" },
      { title: "Gnostic Texts", url: "/pillars/the-vault/codex-reborn/gnostic-texts/" }
    ]),

    // 📜 Text Collection Grid
    pillarGrid: () => ([
      {
        title: "Apocryphon of John",
        desc: "A revelation granted to John by the Living Christ — unveiling Sophia’s fall, the false god Yaldabaoth, and the divine spark hidden within humanity.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/apocryphon-of-john/",
        glyph: "🜂",
        tier: "free",
        state: "default"
      },
      {
        title: "Gospel of Thomas",
        desc: "A collection of secret sayings attributed to Jesus — teaching the inner path of self-knowledge and remembrance of the divine spark.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/gospel-of-thomas/",
        glyph: "✝",
        tier: "free",
        state: "default"
      },
      {
        title: "Gospel of Mary (Magdalene)",
        desc: "Mary’s vision of the soul’s ascent and her defiance of Peter — a lost gospel of inner gnosis and courage, preserved in the Berlin Codex.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/gospel-of-mary/",
        glyph: "🌹",
        tier: "free",
        state: "default"
      },
      {
        title: "Gospel of Truth",
        desc: "A meditation on ignorance, revelation, and the joy of return.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/gospel-of-truth/",
        glyph: "📜",
        tier: "free",
        state: "default"
      },
      {
        title: "The Hypostasis of the Archons",
        desc: "A Gnostic revelation of the cosmic rulers, their dominion over matter, and the soul’s remembrance of its divine origin.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/hypostasis-of-the-archons/",
        glyph: "👁",
        tier: "free",
        state: "default"
      },
      {
        title: "The Second Treatise of the Great Seth",
        desc: "A proclamation of divine laughter from Christ in the Pleroma — mocking the false powers who believed they crucified the true Light.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/second-treatise-of-the-great-seth/",
        glyph: "🕯",
        tier: "free",
        state: "default"
      },
      {
        title: "The Gospel of Phillip",
        desc: "Union, rebirth, and the bridal chamber — the soul’s sacred reunion with the Light.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/gospel-of-philip/",
        glyph: "🕯",
        tier: "free",
        state: "default"
      },
      {
        title: "The Apocalypse of Paul",
        desc: "Paul’s visionary ascent through the heavens — toll gates, interrogators, and the soul’s liberation.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/apocalypse-of-paul/",
        glyph: "🕯",
        tier: "free",
        state: "default"
      },
      {
        title: "Pistis Sophia",
        desc: "Sophia’s lament and the soul’s journey through the Aeons.",
        href: "/pillars/the-vault/codex-reborn/gnostic-texts/pistis-sophia/",
        glyph: "🕯",
        tier: "free",
        state: "coming-soon"
      }
    ])
  }
};

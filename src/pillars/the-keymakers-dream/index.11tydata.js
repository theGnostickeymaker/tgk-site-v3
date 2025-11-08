export default {
  layout: "base.njk",
  pillar: "the-keymakers-dream",
  title: "The Keymaker’s Dream",
  description:
    "A living Gnostic memoir — fragments of awakening, loss, and revelation. The dreamer, the lock, and the memory that would not die.",
  glyph: "🗝️",
  bodyClass: "dream",
  accent: "dream",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-keymakers-dream"],

  // === Header Glyph Row ===
  glyphRow: ["🗝", "🜏", "☯"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Keymaker’s Dream", url: "/pillars/the-keymakers-dream/" }
  ],

  // === Dream pages Grid ===
  pillarGrid: [
    { 
      href: "/pillars/the-keymakers-dream/prologue/", 
      title: "Prologue", 
      glyph: "🗝️", 
      desc: "How the lock appeared — the first whisper in the dreamer’s ear.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-keymakers-dream/the-boy-and-the-lock/", 
      title: "The Boy & the Lock", 
      glyph: "🔒", 
      desc: "The first key, the first silence — where innocence meets initiation.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-keymakers-dream/nang-nang-man/", 
      title: "Codex: Nang Nang Man", 
      glyph: "🪬", 
      desc: "The shadow custodian of memory — guardian of the forgotten and the forbidden.", 
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Synergist Lens (cross-pillar threads) ===
  synergistLens: {
    crossLinks: [
      {
        title: "The Vault – Codex Reborn",
        path: "/pillars/the-vault/codex-reborn/",
        desc: "Where memory and revelation intertwine — the forgotten texts that shape the dream."
      },
      {
        title: "The Gnostic Eye – The Final Idol",
        path: "/pillars/the-gnostic-eye/the-final-idol/",
        desc: "The mirror of modern myth — how the dream replays itself in code, image, and machine prophecy."
      }
    ]
  },

  // === Pillar Display Settings ===
  showLens: true,
  showSeriesNav: false
};

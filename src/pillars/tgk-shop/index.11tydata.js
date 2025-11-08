export default {
  layout: "base.njk",
  pillar: "tgk-shop",
  title: "TGK Shop",
  description:
    "The marketplace of The Gnostic Key — sacred artefacts, symbolic decks, and collector editions crafted for seekers and initiates.",
  glyph: "🛍️",
  bodyClass: "shop",
  accent: "shop",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "tgk-shop"],

  // === Header Glyph Row ===
  glyphRow: ["🜚", "✷", "🜍"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "TGK Shop", url: "/pillars/tgk-shop/" }
  ],

  // === Product Collections Grid ===
  pillarGrid: [
    { 
      href: "/pillars/tgk-shop/codex-arcana/", 
      title: "Codex Arcana — Tarot", 
      glyph: "✷", 
      desc: "The sacred TGK tarot deck — a symbolic key to the mysteries of Light and Shadow.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/tgk-shop/the-real-archetypes/", 
      title: "The Real Archetypes — Deck", 
      glyph: "🃏", 
      desc: "A satirical, truth-telling deck exposing modern power symbols and anti-prophets.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/tgk-shop/prints-and-sigils/", 
      title: "Prints & Sigils", 
      glyph: "🜚", 
      desc: "Limited-edition prints, altar sigils, and symbolic artwork inspired by TGK pages.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/tgk-shop/collector-tokens/", 
      title: "Collector Tokens", 
      glyph: "⨀", 
      desc: "Theme-based tokens and festival credits — physical embodiments of TGK’s symbolic economy.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/tgk-shop/limited-editions/", 
      title: "Limited Editions", 
      glyph: "♜", 
      desc: "Numbered drops, signed artefacts, and seasonal collaborations.",
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/tgk-shop/checkout/", 
      title: "Checkout & Fulfilment", 
      glyph: "💳", 
      desc: "Stripe-powered checkout for secure purchases and delivery management.",
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Stripe / Fulfilment Placeholders ===
  shopConfig: {
    provider: "Stripe",
    currency: "GBP",
    status: "sandbox-ready"
  },

  // === Pillar Display Settings ===
  showLens: false,
  showSeriesNav: false
};

export default {
  layout: "base.njk",
  pillar: "the-obsidian-key",
  title: "The Obsidian Key",
  description:
    "Deep-dive investigations into hidden power, systemic injustice, and the alchemy of empire — decoding the dark machinery behind modern control.",
  glyph: "🜂",
  bodyClass: "obsidian",
  accent: "obsidian",
  tier: "free",

  // === Tagging ===
  tags: ["pillar", "the-obsidian-key"],

  // === Header Glyph Row ===
  glyphRow: ["🜂", "⚖", "🜃"],

  // === Breadcrumb Trail ===
  breadcrumbs: [
    { title: "The Gnostic Key", url: "/" },
    { title: "The Obsidian Key", url: "/pillars/the-obsidian-key/" }
  ],

  // === page Series Grid ===
  pillarGrid: [
    { 
      href: "/pillars/the-obsidian-key/house-of-grift/",  
      title: "House of Grift",   
      glyph: "♛", 
      desc: "Royals, throne lice, and legitimacy theatre — decoding the parasitic lineage of empire and illusion of divine right.", 
      tier: "free", 
      state: "active" 
    },
    { 
      href: "/pillars/the-obsidian-key/systemic/",        
      title: "SYSTEMIC",         
      glyph: "⚖", 
      desc: "Rights erosion, courtroom alchemy, and the machinery of law — mapping injustice as a ritual system.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-obsidian-key/empire-codes/",    
      title: "Empire Codes",     
      glyph: "¤", 
      desc: "Finance, robber barons, and debt sorcery — tracing how currency became faith and obedience.", 
      tier: "free", 
      state: "coming-soon" 
    },
    { 
      href: "/pillars/the-obsidian-key/gnostic-liberation/", 
      title: "Gnostic Liberation", 
      glyph: "⨳", 
      desc: "Race, colonisation, and resistance — the spiritual reckoning with whiteness, class, and empire.", 
      tier: "free", 
      state: "coming-soon" 
    }
  ],

  // === Synergist Lens (cross-pillar threads) ===
  synergistLens: {
    crossLinks: [
      {
        title: "The Gnostic Eye – The Puppet Strings",
        path: "/pillars/the-gnostic-eye/the-puppet-strings/",
        desc: "Revealing the same control geometry through media, myth, and narrative warfare."
      },
      {
        title: "The Teachings – Know Your Rights",
        path: "/pillars/the-teachings/know-your-rights/",
        desc: "Practical armour for the soul in a rigged legal world — from law to liberation."
      },
      {
        title: "The Vault – Codex Reborn",
        path: "/pillars/the-vault/codex-reborn/",
        desc: "Historical parallels to ancient empires — how the same structures of rule repeat through ages."
      }
    ]
  },

  // === Pillar Display Settings ===
  showLens: true,
  showSeriesNav: false
};

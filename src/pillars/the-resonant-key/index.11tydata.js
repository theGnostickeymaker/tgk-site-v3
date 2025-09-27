export default {
  eleventyComputed: {
    pillarGrid: () => ([
      { 
        href: "#", 
        title: "Audiobooks", 
        glyph: "📖", 
        desc: "Spoken scrolls of TGK, voiced and alive.", 
        tier: "free", 
        state: "coming-soon" 
      },
      { 
        href: "#", 
        title: "Sound Rituals", 
        glyph: "🔊", 
        desc: "Immersive rites of sound & memory.", 
        tier: "free", 
        state: "coming-soon" 
      },
      { 
        href: "#", 
        title: "Immersive Journeys", 
        glyph: "🌌", 
        desc: "Audio-visual pilgrimages.", 
        tier: "free", 
        state: "coming-soon" 
      }
    ])
  }
};

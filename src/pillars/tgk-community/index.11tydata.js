export default {
  eleventyComputed: {
    pillarGrid: () => ([
      { 
        href: "#", 
        title: "Forums", 
        glyph: "💬", 
        desc: "Discussion boards.", 
        tier: "free", 
        state: "coming-soon" 
      },
      { 
        href: "#", 
        title: "Study Circles", 
        glyph: "📚", 
        desc: "Read, decode, together.", 
        tier: "free", 
        state: "coming-soon" 
      },
      { 
        href: "#", 
        title: "Live Sessions", 
        glyph: "🎥", 
        desc: "Talks, Q&A, rituals.", 
        tier: "free", 
        state: "coming-soon" 
      }
    ])
  }
};

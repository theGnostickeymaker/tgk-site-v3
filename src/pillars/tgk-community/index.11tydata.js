export default {
  eleventyComputed: {
    pillarGrid: () => ([
      { href: "#", title: "Forums",        glyph: "💬", desc: "Discussion boards.",      state: "soon" },
      { href: "#", title: "Study Circles", glyph: "📚", desc: "Read, decode, together.", state: "soon" },
      { href: "#", title: "Live Sessions", glyph: "🎥", desc: "Talks, Q&A, rituals.",    state: "soon" }
    ])
  }
};

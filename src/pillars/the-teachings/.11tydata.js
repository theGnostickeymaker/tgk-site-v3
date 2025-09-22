// src/pillars/the-teachings/.11tydata.js (ESM)
export default {
  // pillar-level metadata
  accent: "gold",
  pillarId: "the-teachings",
  pillarName: "The Teachings",
  pillarUrl: "/tgk-teachings/",             // public URL base
  pillarGlyphs: ["✶","◎","✶"],             // array is best (string also supported)
  pillarTagline: "Sacred studies ✦ charting the unknown shores of the soul",

  // ensure header gets solid defaults (still overrideable per page)
  eleventyComputed: {
    header: (data) => ({
      ...(data.header || {}),
      pillar: "the-teachings",
      pillarTitle: "The Teachings",
      accentClass: (data.header && data.header.accentClass) || "accent-gold",
      glyphs: (data.header && data.header.glyphs) || ["✶","◎","✶"],
      tagline: (data.header && data.header.tagline) || "Sacred studies ✦ charting the unknown shores of the soul"
    })
  }
};

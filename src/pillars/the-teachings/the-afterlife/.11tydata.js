// src/pillars/the-teachings/the-afterlife/.11tydata.js (ESM)
export default {
  series: "the-afterlife",
  seriesTitle: "The Afterlife Series",
  eleventyComputed: {
    header: (data) => ({
      ...(data.header || {}),
      series: "the-afterlife",
      seriesTitle: "The Afterlife Series"
    })
  }
};

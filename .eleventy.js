// eleventy.config.js (ESM)
import dotenv from "dotenv";
import fs from "node:fs";
dotenv.config();

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
export default function(eleventyConfig) {
  /* =========================
     0) Core settings
  ========================= */
  eleventyConfig.setDataDeepMerge(true);

  /* =========================
     1) Passthrough
  ========================= */
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });

  // ⚠️ your pages reference /TGK-assets/... (capital T G K)
  // keep the public folder name consistent to avoid 404s
  eleventyConfig.addPassthroughCopy({ "src/media/TGK-assets": "TGK-assets" });
  // If you also have a lowercase dir, keep this line too:
  // eleventyConfig.addPassthroughCopy({ "src/media/tgk-assets": "tgk-assets" });

  // Favicons / robots (optional)
  if (fs.existsSync("src/favicon.ico")) eleventyConfig.addPassthroughCopy("src/favicon.ico");
  if (fs.existsSync("src/robots.txt"))  eleventyConfig.addPassthroughCopy("src/robots.txt");

  /* =========================
     2) Collections
  ========================= */
  eleventyConfig.addCollection("content", (coll) =>
    coll.getFilteredByGlob("src/pillars/**/*.md")
  );

  // Helpers work with either new header.* model or legacy top-level fields
  const read = (item, path) => path.split(".").reduce((v,k)=> (v && v[k]!==undefined ? v[k] : undefined), item);

  eleventyConfig.addFilter("bySeries", (items, series) =>
    items.filter(i => {
      const a = (read(i.data,"header.series") || i.data.series || "").toLowerCase();
      return a === (series||"").toLowerCase();
    })
  );

  eleventyConfig.addFilter("byPillar", (items, pillar) =>
    items.filter(i => {
      const a = (read(i.data,"header.pillar") || i.data.pillar || "").toLowerCase();
      return a === (pillar||"").toLowerCase();
    })
  );

  eleventyConfig.addFilter("sortByEpisode", (items) =>
    items.slice().sort((a, b) =>
      ((read(a.data,"header.episode") ?? a.data.episode ?? 0) - (read(b.data,"header.episode") ?? b.data.episode ?? 0))
    )
  );

  /* =========================
     3) Filters / Shortcodes
  ========================= */
  eleventyConfig.addFilter("labelize", s => (s||"")
    .replace(/[-_]+/g," ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
  );

  eleventyConfig.addShortcode("video", (src, caption="") => `
    <figure class="tgk-video">
      <video controls src="${src}" preload="metadata"></video>
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `);

  eleventyConfig.addShortcode("audio", (src, caption="") => `
    <figure class="tgk-audio">
      <audio controls src="${src}"></audio>
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `);

  eleventyConfig.addShortcode("pdf", (src, height=800) => `
    <iframe class="tgk-pdf" src="${src}" width="100%" height="${height}" loading="lazy"></iframe>
  `);

  /* =========================
     4) Dev server niceties
  ========================= */
  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");
  eleventyConfig.addWatchTarget("src/_includes");
  eleventyConfig.addWatchTarget("src/_data");
  eleventyConfig.addWatchTarget("src/pillars");

  /* =========================
     5) Return
  ========================= */
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
}

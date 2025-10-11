// eleventy.config.js  (ESM)
import "dotenv/config";
import fs from "node:fs";

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
export default function(eleventyConfig) {
  /* =========================
     0) Core
  ========================= */
  eleventyConfig.setDataDeepMerge(true);

  /* =========================
     1) Passthrough
  ========================= */
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });

  // Keep tgk-assets mapping consistent (pages use /tgk-assets/…)
  if (fs.existsSync("src/media/tgk-assets")) {
    eleventyConfig.addPassthroughCopy({ "src/media/tgk-assets": "tgk-assets" });
  }

  // Favicons / robots (optional)
  if (fs.existsSync("src/favicon.ico")) eleventyConfig.addPassthroughCopy("src/favicon.ico");
  if (fs.existsSync("src/robots.txt"))  eleventyConfig.addPassthroughCopy("src/robots.txt");

  /* =========================
     2) Collections & Filters
  ========================= */
  // Content collection (markdown scrolls)
  eleventyConfig.addCollection("content", coll =>
    coll.getFilteredByGlob("src/pillars/**/*.md")
  );

  const read = (obj, path) =>
    path.split(".").reduce((v, k) => (v && v[k] !== undefined ? v[k] : undefined), obj);

  eleventyConfig.addFilter("bySeries", (items = [], series = "") =>
    items.filter(i => {
      const a = (read(i.data, "header.series") || i.data.series || "").toLowerCase();
      return a === series.toLowerCase();
    })
  );

  eleventyConfig.addFilter("byPillar", (items = [], pillar = "") =>
    items.filter(i => {
      const a = (read(i.data, "header.pillar") || i.data.pillar || "").toLowerCase();
      return a === pillar.toLowerCase();
    })
  );

  eleventyConfig.addFilter("sortByEpisode", (items = []) =>
    items.slice().sort((a, b) =>
      ((read(a.data, "header.episode") ?? a.data.episode ?? 0) -
       (read(b.data, "header.episode") ?? b.data.episode ?? 0))
    )
  );

  eleventyConfig.addFilter("labelize", s => (s || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
  );

  eleventyConfig.addFilter("normpath", (s = "") => s.replace(/\\/g, "/"));
  eleventyConfig.addFilter("split", (s = "", sep = "/") => (s + "").split(sep));

  eleventyConfig.addFilter("date", (v, fmt = "yyyy-LL-dd") => {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d)) return "";
    // Simple ISO yyyy-mm-dd; Eleventy’s Luxon filter can replace this later if you prefer
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("bySeriesVersion", (items = [], version = 1) =>
    items.filter(i => {
      const v = (i.data.seriesMeta && i.data.seriesMeta.series_version) || i.data.series_version || 1;
      return parseInt(v) === parseInt(version);
    })
  );

    // Roman numeral filter
    eleventyConfig.addFilter("roman", function (num) {
      if (!num || isNaN(num)) return "";
      const map = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
      ];
      let result = "";
      for (const [value, numeral] of map) {
        while (num >= value) {
          result += numeral;
          num -= value;
        }
      }
      return result;
    });

    //--------------------------------------------------------------
    // 🧩 Add fromJson filter (for retrofit YAML literal blocks)
    //--------------------------------------------------------------
    eleventyConfig.addFilter("fromJson", function(value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        console.warn("⚠️ fromJson filter could not parse:", value);
        return [];
      }
    });


  /* =========================
     3) Shortcodes
  ========================= */
  eleventyConfig.addShortcode("video", (src, caption = "") => `
    <figure class="tgk-video">
      <video controls src="${src}" preload="metadata"></video>
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `);

  eleventyConfig.addShortcode("audio", (src, caption = "") => `
    <figure class="tgk-audio">
      <audio controls src="${src}"></audio>
      ${caption ? `<figcaption>${caption}</figcaption>` : ""}
    </figure>
  `);

  eleventyConfig.addShortcode("pdf", (src, height = 800) => `
    <iframe class="tgk-pdf" src="${src}" width="100%" height="${height}" loading="lazy"></iframe>
  `);

  /* =========================
     4) Dev server watch
  ========================= */
  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");
  eleventyConfig.addWatchTarget("src/_includes");
  eleventyConfig.addWatchTarget("src/_data");
  eleventyConfig.addWatchTarget("src/pillars");

  /* =========================
     5) Layout alias (optional)
     Use `layout: base` if you want; otherwise keep using `layout: base.njk`.
  ========================= */
  eleventyConfig.addLayoutAlias("base", "base.njk");

  /* =========================
     6) Return
  ========================= */
  return {
    dir: {
      input:  "src",
      includes: "_includes",
      data:   "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"]
  };
}

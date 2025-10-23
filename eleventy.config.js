// ==========================================================
// 🧠 The Gnostic Key — Eleventy Config (Unified v3.3 ESM)
// ==========================================================

import "dotenv/config";
import fs from "node:fs";
import { DateTime } from "luxon";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";

/** @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig */
export default function (eleventyConfig) {

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

  if (fs.existsSync("src/media/tgk-assets")) {
    eleventyConfig.addPassthroughCopy({ "src/media/tgk-assets": "tgk-assets" });
  }

  eleventyConfig.addPassthroughCopy({ "src/tgk-assets/favicon": "tgk-assets/favicon" });
  eleventyConfig.addPassthroughCopy("favicon.ico");

  if (fs.existsSync("src/robots.txt")) {
    eleventyConfig.addPassthroughCopy("src/robots.txt");
  }

  /* =========================
     2) Collections & Filters
  ========================= */
  const read = (obj, path) =>
    path.split(".").reduce((v, k) => (v && v[k] !== undefined ? v[k] : undefined), obj);

  eleventyConfig.addCollection("content", coll =>
    coll.getFilteredByGlob("src/pillars/**/*.md")
  );

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
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  });

  eleventyConfig.addFilter("bySeriesVersion", (items = [], version = 1) =>
    items.filter(i => {
      const v = (i.data.seriesMeta && i.data.seriesMeta.series_version) ||
                i.data.series_version || 1;
      return parseInt(v) === parseInt(version);
    })
  );

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

  eleventyConfig.addFilter("fromJson", function (value) {
    try {
      return JSON.parse(value);
    } catch {
      console.warn("⚠️ fromJson filter could not parse:", value);
      return [];
    }
  });

  eleventyConfig.addFilter("tgkDate", (value) => {
    if (!value) return "";
    const dt = DateTime.fromISO(value);
    const d = dt.day;
    const suffix = (n) => {
      const v = n % 100;
      if (v >= 11 && v <= 13) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    return `${d}${suffix(d)} ${dt.toFormat("MMM yyyy")}`;
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
     5) Layout alias
  ========================= */
  eleventyConfig.addLayoutAlias("base", "base.njk");

  /* =========================
     6) Plugins
  ========================= */
  eleventyConfig.addPlugin(pluginSitemap, {
    sitemap: {
      hostname: "https://thegnostickey.com",
      changefreq: "weekly",
      priority(page) {
        const tier = page.data.tier || "free";
        if (tier === "free") return 1.0;
        if (tier === "initiate") return 0.8;
        if (tier === "full") return 0.6;
        return 0.7;
      },
      lastmodDateExtractor: (page) => page.data.published || page.date,
    },
  });

  /* =========================
     7) Directory-style URLs
  ========================= */
  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });

  /* =========================
     8) Return
  ========================= */
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
    passthroughFileCopy: true,
    // ✅ This line ensures all pages build as /folder/index.html
    dirOutput: "dir"
  };
}

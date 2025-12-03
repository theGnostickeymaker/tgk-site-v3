// ==========================================================
// 🧠 The Gnostic Key — Eleventy Config (Unified v3.3 Stable)
// ==========================================================

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";

export default function (eleventyConfig) {

  // ==========================================================
  // 0) Environment variables available to all Nunjucks templates
  // ==========================================================
  eleventyConfig.addGlobalData("env", process.env);

  console.log("🔥 Firebase env loaded:");
  console.log("API:", process.env.FIREBASE_API_KEY);
  console.log("Domain:", process.env.FIREBASE_AUTH_DOMAIN);
  console.log("Project:", process.env.FIREBASE_PROJECT_ID);


  // ==========================================================
  // 1) Core
  // ==========================================================
  eleventyConfig.setDataDeepMerge(true);


  // ==========================================================
  // 2) Passthrough Copy (Safe)
  // ==========================================================
  console.log("🜂 TGK Passthrough copy setup");
  console.log("📁 Checking src/js →", fs.existsSync("src/js"));

  // Copy JS folder, EXCEPT firebase-init.njk (templated output)
  eleventyConfig.addPassthroughCopy({
    "src/js": "js"
  });

  // Exclude firebase-init.njk from passthrough
  eleventyConfig.ignores.add("src/js/firebase-init.njk");

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy({ "src/_data/quiz": "quiz" });
  eleventyConfig.addPassthroughCopy("src/tgk-assets/favicon");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("src/tgk-assets");
  eleventyConfig.addPassthroughCopy("src/_headers");

  if (fs.existsSync("src/robots.txt")) {
    eleventyConfig.addPassthroughCopy("src/robots.txt");
  }

  eleventyConfig.addFilter("absoluteUrl", function (path) {
    if (!path) return "";
    let base = this.ctx.site?.url || process.env.SITE_URL || "http://localhost:8080";
    return new URL(path, base).href;
  });


  // ==========================================================
  // 3) Quiz JSON Auto-Build
  // ==========================================================
  try {
    const quizModulePath = path.resolve("./src/_data/quiz/index.js");
    const quizMap = require(quizModulePath);
    const mapObj = quizMap.default || quizMap;

    fs.writeFileSync("./src/_data/quiz/index.json",
      JSON.stringify(mapObj, null, 2),
      "utf8"
    );

    console.log("🧩 TGK Quiz index.json regenerated");
  } catch (err) {
    console.warn("⚠️ TGK Quiz JSON generation skipped:", err.message);
  }


  // ==========================================================
  // 4) Collections & Filters
  // ==========================================================
  const read = (obj, pathStr) =>
    pathStr.split(".").reduce((v, k) => (v && v[k] !== undefined ? v[k] : undefined), obj);

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

  eleventyConfig.addFilter("date", (v) => {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d)) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  });

  eleventyConfig.addFilter("roman", num => {
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

  eleventyConfig.addFilter("fromJson", value => {
    try {
      return JSON.parse(value);
    } catch {
      console.warn("⚠️ fromJson filter failed:", value);
      return [];
    }
  });

  eleventyConfig.addFilter("tgkDate", value => {
    if (!value) return "";
    const dt = DateTime.fromISO(value);
    const d = dt.day;
    const suffix = n => {
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


  // ==========================================================
  // 5) Shortcodes
  // ==========================================================
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


  // ==========================================================
  // 6) Dev Server Watch Targets
  // ==========================================================
  eleventyConfig.addWatchTarget("src/css");
  eleventyConfig.addWatchTarget("src/js");
  eleventyConfig.addWatchTarget("src/_includes");
  eleventyConfig.addWatchTarget("src/_data");
  eleventyConfig.addWatchTarget("src/pillars");


  // ==========================================================
  // 7) Layout Aliases
  // ==========================================================
  eleventyConfig.addLayoutAlias("base", "base.njk");


  // ==========================================================
  // 8) Plugins
  // ==========================================================
  eleventyConfig.addPlugin(pluginSitemap, {
    sitemap: {
      hostname: "https://thegnostickey.com",
      changefreq: "weekly",
      priority(page) {
        const tier = page.data.tier || "free";
        if (tier === "free") return 1.0;
        if (tier === "initiate") return 0.8;
        if (tier === "adept") return 0.6;
        return 0.7;
      },
      lastmodDateExtractor: page => page.data.published || page.date,
    },
  });


  // ==========================================================
  // 9) Directory-style URLs
  // ==========================================================
  eleventyConfig.setBrowserSyncConfig({ ghostMode: false });


  // ==========================================================
  // 10) Build Verification
  // ==========================================================
  eleventyConfig.on("afterBuild", () => {
    const file = "_site/js/bookmarks.js";
    if (fs.existsSync(file)) {
      console.log(`✅ TGK Build: Found ${file}`);
    } else {
      console.error(`❌ TGK Build Error: ${file} missing! Check passthrough copy.`);
      process.exit(1);
    }
  });


  // ==========================================================
  // 11) Return config
  // ==========================================================
  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"], // JS no longer rendered as templates
    passthroughFileCopy: true,
  };
}

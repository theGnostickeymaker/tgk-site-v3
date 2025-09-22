// Recursively list every .css file under src/css.
// Returns URL-ish paths relative to /css (e.g., "cards.css", "sub/thing.css").
import { readdirSync } from "node:fs";
import { join } from "node:path";

function listCss(dir, rel = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listCss(abs, nextRel));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".css")) {
      out.push(nextRel.replace(/\\/g, "/"));
    }
  }
  // predictable order; prefix filenames (01-, 10-) if you need control
  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export default function () {
  const root = join(process.cwd(), "src", "css");
  try { return { all: listCss(root) }; }
  catch { return { all: ["main.css"] }; }
}

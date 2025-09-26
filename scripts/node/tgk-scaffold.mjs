#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function writeFile(p, content){
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (!fs.existsSync(p)) fs.writeFileSync(p, content, "utf8");
  console.log("✔", p);
}

function series({ pillarSlug, seriesSlug, seriesNo, pillarLabel, seriesLabel, accent="gold", glyph="✶", desc="" }){
  const root = "src";
  const pillarDir = path.join(root, "pillars", pillarSlug);
  const seriesDir = path.join(pillarDir, seriesSlug, `series-${seriesNo}`);

  fs.mkdirSync(seriesDir, { recursive: true });

  const pillarIndex = path.join(pillarDir, "index.njk");
  if (!fs.existsSync(pillarIndex)) {
    writeFile(pillarIndex, `---
layout: base.njk
title: "${pillarLabel}"
description: "${desc}"
accent: "${accent}"
glyph: "${glyph}"
---
<section class="pillar-hero"><p class="lead">${desc}</p></section>
<section class="pillar-grid">
  <ul class="card-grid">
    <li class="card"><a href="/pillars/${pillarSlug}/${seriesSlug}/series-${seriesNo}/">${seriesLabel} — Series ${seriesNo}</a></li>
  </ul>
</section>
`);
  }

  writeFile(path.join(seriesDir, "index.njk"), `---
layout: base.njk
title: "${seriesLabel} — Series ${seriesNo}"
description: "${desc}"
accent: "${accent}"
glyph: "${glyph}"
---
<section class="series-hero"><p class="lead">${seriesLabel} — Series ${seriesNo}</p></section>
<section class="series-links"><ul class="card-grid"></ul></section>
`);

  writeFile(path.join(seriesDir, "series.11tydata.js"), `export default {
  header: { pillar: "${pillarLabel}", series: "${seriesLabel}", seriesNo: ${seriesNo} },
  permalink: "/pillars/${pillarSlug}/${seriesSlug}/series-${seriesNo}/index.html"
};
`);
}

function episode({ pillarSlug, seriesSlug, seriesNo, episodeSlug, title, episode, tier="free", accent="gold", glyph="✶", quizId="" }){
  const epDir = path.join("src","pillars", pillarSlug, seriesSlug, `series-${seriesNo}`, episodeSlug);
  fs.mkdirSync(epDir, { recursive: true });

  const quizBlock = quizId ? `
<section class="quiz-block" data-quiz="${quizId}">
  <script type="application/json" class="quiz-data">{{ quiz['${quizId}'] | json | safe }}</script>
  <h2>🧠 Quiz</h2>
  <div class="quiz-container"></div>
</section>` : "";

  writeFile(path.join(epDir, "index.njk"), `---
layout: base.njk
title: "${title}"
description: ""
tier: "${tier}"
accent: "${accent}"
glyph: "${glyph}"
header:
  pillar: "${pillarSlug}"
  series: "${seriesSlug}"
  seriesNo: ${seriesNo}
  episode: ${episode}
---
<section class="scroll-intro"><p class="lead">${title}</p></section>
<section class="scroll-content"><h2>Part I</h2><p>Start writing…</p></section>
${quizBlock}
`);
}

function quiz({ quizId, pillarSlug, seriesSlug, seriesNo }){
  const p = path.join("src","_data","quiz", pillarSlug, seriesSlug, `series-${seriesNo}`, `${quizId}.js`);
  writeFile(p, `export default {
  id: "${quizId}",
  title: "${quizId} Quiz",
  questions: [{ prompt: "Example question?", options: ["A","B","C","D"], correct: "A"}]
};
`);
}

function help(){
  console.log(`TGK Scaffold
Usage:
  node scripts/node/tgk-scaffold.mjs series --pillar the-teachings --series the-afterlife --no 1 --plabel "The Teachings" --slabel "The Afterlife" --accent gold --glyph "✶" --desc "Afterlife Series."
  node scripts/node/tgk-scaffold.mjs episode --pillar the-teachings --series the-afterlife --no 1 --epslug buddhism --title "Buddhism · Part I" --ep 1 --tier free --accent gold --glyph "☸" --quiz afterlife-s1-buddhism-part1
  node scripts/node/tgk-scaffold.mjs quiz --id afterlife-s1-buddhism-part1 --pillar the-teachings --series the-afterlife --no 1
`);
}

const args = process.argv.slice(2);
const cmd = args[0];
const opt = Object.fromEntries(
  args.slice(1).reduce((acc,cur,i,arr)=>{
    if (cur.startsWith("--")){
      const key = cur.replace(/^--/,"");
      const val = (arr[i+1] && !arr[i+1].startsWith("--")) ? arr[i+1] : true;
      acc.push([key,val]);
    }
    return acc;
  }, [])
);

try{
  if (!cmd) { help(); process.exit(0); }
  if (cmd === "series") series({
    pillarSlug: opt.pillar, seriesSlug: opt.series, seriesNo: Number(opt.no),
    pillarLabel: opt.plabel, seriesLabel: opt.slabel, accent: opt.accent, glyph: opt.glyph, desc: opt.desc || ""
  });
  else if (cmd === "episode") episode({
    pillarSlug: opt.pillar, seriesSlug: opt.series, seriesNo: Number(opt.no),
    episodeSlug: opt.epslug, title: opt.title, episode: Number(opt.ep),
    tier: opt.tier || "free", accent: opt.accent || "gold", glyph: opt.glyph || "✶", quizId: opt.quiz || ""
  });
  else if (cmd === "quiz") quiz({
    quizId: opt.id, pillarSlug: opt.pillar, seriesSlug: opt.series, seriesNo: Number(opt.no)
  });
  else help();
}catch(e){
  console.error("Error:", e.message);
  process.exit(1);
}

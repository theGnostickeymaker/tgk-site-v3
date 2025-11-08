import fs from "fs";
import path from "path";
import quizMap from "../src/_data/quiz/index.js";

const outDir = "./src/_data/quiz";
fs.writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify(quizMap, null, 2),
  "utf8"
);

console.log("✅ Quiz index.json generated");
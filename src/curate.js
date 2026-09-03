import { mkdir, readFile, writeFile } from "node:fs/promises";
import { summarize, uncurated } from "./summarize.js";

const date = process.argv[2];
if (!date) {
  console.error("usage: node src/curate.js <YYYY-MM-DD>");
  process.exit(1);
}

const raw = JSON.parse(await readFile(`data/${date}.json`, "utf8"));
let digest;
try {
  digest = await summarize(raw);
} catch (err) {
  console.error(`summarization failed, publishing uncurated: ${err.message}`);
  digest = uncurated(raw);
}
await mkdir("digests", { recursive: true });
await writeFile(
  `digests/${date}.json`,
  JSON.stringify(digest, null, 2) + "\n",
);
console.log(`digests/${date}.json curated=${digest.curated}`);

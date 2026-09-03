import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { buildSite } from "./site.js";

const files = (await readdir("digests"))
  .filter((f) => f.endsWith(".json"))
  .sort()
  .reverse();
if (files.length === 0) {
  console.error("no digests to render");
  process.exit(1);
}
const digests = await Promise.all(
  files.map(async (f) => JSON.parse(await readFile(`digests/${f}`, "utf8"))),
);

const site = buildSite(digests);
for (const [path, content] of site) {
  await mkdir(dirname(`site/${path}`), { recursive: true });
  await writeFile(`site/${path}`, content);
}
console.log(`site/: ${site.size} files from ${digests.length} digests`);

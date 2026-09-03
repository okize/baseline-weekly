import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { digestWindow } from "./window.js";
import { fetchBaselineFeatures } from "./fetch-baseline.js";
import { fetchNodeReleases } from "./fetch-node.js";
import { filterSeen } from "./dedupe.js";

async function loadDigests(dir = "digests") {
  let files;
  try {
    files = await readdir(dir);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  return Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => JSON.parse(await readFile(`${dir}/${f}`, "utf8"))),
  );
}

const window = digestWindow();
const raw = {
  date: window.end,
  window,
  web: await fetchBaselineFeatures(window),
  node: await fetchNodeReleases(window),
};
const filtered = filterSeen(raw, await loadDigests());
await mkdir("data", { recursive: true });
await writeFile(
  `data/${window.end}.json`,
  JSON.stringify(filtered, null, 2) + "\n",
);
console.log(
  `data/${window.end}.json: ${filtered.web.length} web, ${filtered.node.length} node`,
);

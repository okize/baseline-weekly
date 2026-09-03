import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fetchNodeReleases,
  extractNotableChanges,
} from "../src/fetch-node.js";

const WINDOW = { start: "2026-08-24", end: "2026-08-30" };

const CHANGELOG = `# Node.js 26 ChangeLog

<a id="26.8.10"></a>

## 2026-10-01, Version 26.8.10 (Current), @releaser

### Notable Changes

- future release, must not match 26.8.1

### Commits

- commit list

<a id="26.8.1"></a>

## 2026-08-26, Version 26.8.1 (Current), @aduh95

### Notable Changes

- **crypto**: added something useful
- **fs**: fixed a thing

### Commits

- more commits
`;

test("extracts the Notable Changes section for an exact version", () => {
  const notes = extractNotableChanges(CHANGELOG, "26.8.1");
  assert.match(notes, /crypto.*added something useful/);
  assert.match(notes, /fs.*fixed a thing/);
  assert.doesNotMatch(notes, /must not match/);
  assert.doesNotMatch(notes, /Commits/);
});

test("returns null when the version or heading is missing", () => {
  assert.equal(extractNotableChanges(CHANGELOG, "99.0.0"), null);
  assert.equal(extractNotableChanges("## 2026-01-01, Version 1.0.0 (Current), @x\nno headings", "1.0.0"), null);
});

test("filters releases to the window and labels release lines", async () => {
  const index = [
    { version: "v26.8.1", date: "2026-08-26", lts: false, security: false },
    { version: "v24.20.0", date: "2026-08-26", lts: "Krypton", security: false },
    { version: "v26.7.0", date: "2026-08-10", lts: false, security: false },
  ];
  const impl = async (url) => {
    const u = String(url);
    if (u.endsWith("index.json")) {
      return { ok: true, status: 200, json: async () => index };
    }
    return { ok: true, status: 200, text: async () => CHANGELOG };
  };

  const releases = await fetchNodeReleases(WINDOW, impl);

  assert.equal(releases.length, 2);
  assert.equal(releases[0].version, "26.8.1");
  assert.equal(releases[0].line, "Current");
  assert.equal(releases[0].link, "https://github.com/nodejs/node/releases/tag/v26.8.1");
  assert.match(releases[0].notableChanges, /crypto/);
  assert.equal(releases[1].line, "LTS (Krypton)");
});

test("throws when the release index is not OK", async () => {
  const impl = async () => ({ ok: false, status: 503 });
  await assert.rejects(() => fetchNodeReleases(WINDOW, impl), /index returned 503/);
});

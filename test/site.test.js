import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../src/html.js";
import { buildSite } from "../src/site.js";

const DIGESTS = [
  {
    date: "2026-09-06",
    curated: true,
    intro: "Two items this week.",
    web: [{
      id: "a", name: "Feature <A>", blurb: "Does A & more.",
      link: "https://webstatus.dev/features/a", baselineDate: "2026-09-01",
    }],
    node: [{
      version: "26.8.1", line: "Current", blurb: "Ships stuff.",
      link: "https://github.com/nodejs/node/releases/tag/v26.8.1",
      date: "2026-08-26", notableChanges: "- **crypto**: thing",
    }],
  },
  {
    date: "2026-08-30",
    curated: false,
    intro: "This week's items, without commentary. (Automatic summarization failed.)",
    web: [],
    node: [],
  },
];

test("escapeHtml escapes markup characters", () => {
  assert.equal(escapeHtml(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
});

test("buildSite produces index, archive pages, and feed", () => {
  const site = buildSite(DIGESTS);
  assert.deepEqual(
    [...site.keys()].sort(),
    ["archive/2026-08-30.html", "archive/2026-09-06.html", "feed.xml", "index.html"],
  );
});

test("index shows the latest digest with escaped content and links", () => {
  const index = buildSite(DIGESTS).get("index.html");
  assert.match(index, /Two items this week\./);
  assert.match(index, /Feature &lt;A&gt;/);
  assert.match(index, /Does A &amp; more\./);
  assert.match(index, /href="https:\/\/webstatus\.dev\/features\/a"/);
  assert.match(index, /26\.8\.1/);
  assert.match(index, /archive\/2026-08-30\.html/); // archive list
});

test("empty week renders the quiet-week message", () => {
  const page = buildSite(DIGESTS).get("archive/2026-08-30.html");
  assert.match(page, /Nothing new this week\./);
});

test("feed has one item per digest with absolute links", () => {
  const feed = buildSite(DIGESTS).get("feed.xml");
  assert.match(feed, /<\?xml version="1.0"/);
  assert.equal(feed.match(/<item>/g).length, 2);
  assert.match(feed, /https:\/\/okize\.github\.io\/baseline-weekly\/archive\/2026-09-06\.html/);
  assert.match(feed, /<pubDate>Sun, 06 Sep 2026/);
});

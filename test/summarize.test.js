import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, uncurated } from "../src/summarize.js";

const RAW = {
  date: "2026-09-06",
  web: [{ id: "a", name: "Feature A", link: "https://example.com/a", baselineDate: "2026-09-01" }],
  node: [{ version: "26.8.1", line: "Current", link: "https://example.com/n", date: "2026-08-26" }],
};

function fakeClient(parsedOutput) {
  return {
    messages: {
      parse: async () => ({ parsed_output: parsedOutput }),
    },
  };
}

test("joins blurbs onto raw items by id and version", async () => {
  const client = fakeClient({
    intro: "A quiet week.",
    web: [{ id: "a", blurb: "Does A." }],
    node: [{ version: "26.8.1", blurb: "Ships B." }],
  });

  const digest = await summarize(RAW, client);

  assert.equal(digest.curated, true);
  assert.equal(digest.intro, "A quiet week.");
  assert.equal(digest.web[0].blurb, "Does A.");
  assert.equal(digest.web[0].link, "https://example.com/a");
  assert.equal(digest.node[0].blurb, "Ships B.");
});

test("throws when the model output cannot be parsed", async () => {
  await assert.rejects(
    () => summarize(RAW, fakeClient(null)),
    /unparseable/,
  );
});

test("uncurated keeps items, empties blurbs, sets curated false", () => {
  const digest = uncurated(RAW);
  assert.equal(digest.curated, false);
  assert.equal(digest.web[0].blurb, "");
  assert.equal(digest.web[0].name, "Feature A");
  assert.match(digest.intro, /without commentary/);
});

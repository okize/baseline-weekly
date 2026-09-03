import { test } from "node:test";
import assert from "node:assert/strict";
import { filterSeen } from "../src/dedupe.js";

test("drops web features and node versions seen in prior digests", () => {
  const raw = {
    date: "2026-09-06",
    web: [{ id: "a" }, { id: "b" }],
    node: [{ version: "26.8.1" }, { version: "24.20.0" }],
  };
  const prior = [
    { web: [{ id: "a" }], node: [{ version: "24.20.0" }] },
    { web: [], node: [] },
  ];

  const filtered = filterSeen(raw, prior);

  assert.deepEqual(filtered.web, [{ id: "b" }]);
  assert.deepEqual(filtered.node, [{ version: "26.8.1" }]);
  assert.equal(filtered.date, "2026-09-06");
});

test("handles digests with missing sections", () => {
  const raw = { date: "d", web: [{ id: "a" }], node: [] };
  const filtered = filterSeen(raw, [{}]);
  assert.equal(filtered.web.length, 1);
});

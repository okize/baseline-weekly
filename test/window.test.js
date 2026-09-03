import { test } from "node:test";
import assert from "node:assert/strict";
import { digestWindow } from "../src/window.js";

test("Monday run covers the previous Monday through Sunday", () => {
  const w = digestWindow(new Date("2026-09-07T13:00:00Z"));
  assert.deepEqual(w, { start: "2026-08-31", end: "2026-09-06" });
});

test("mid-week run still ends on the most recent Sunday", () => {
  const w = digestWindow(new Date("2026-09-09T02:00:00Z"));
  assert.deepEqual(w, { start: "2026-08-31", end: "2026-09-06" });
});

test("Sunday run ends on that same Sunday", () => {
  const w = digestWindow(new Date("2026-09-06T13:00:00Z"));
  assert.deepEqual(w, { start: "2026-08-31", end: "2026-09-06" });
});

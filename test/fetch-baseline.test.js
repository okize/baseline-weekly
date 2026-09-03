import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchBaselineFeatures } from "../src/fetch-baseline.js";

const WINDOW = { start: "2026-08-31", end: "2026-09-06" };

function fakeFetch(pages) {
  const calls = [];
  const impl = async (url) => {
    calls.push(new URL(url));
    const token = new URL(url).searchParams.get("page_token");
    const page = pages[token ?? "first"];
    return { ok: true, status: 200, json: async () => page };
  };
  impl.calls = calls;
  return impl;
}

test("maps features and follows pagination", async () => {
  const impl = fakeFetch({
    first: {
      data: [{
        feature_id: "sibling-count",
        name: "sibling-count() and sibling-index()",
        baseline: { status: "newly", low_date: "2026-09-01" },
      }],
      metadata: { next_page_token: "t2" },
    },
    t2: {
      data: [{
        feature_id: "foo",
        name: "Foo",
        baseline: { status: "newly", low_date: "2026-09-03" },
      }],
      metadata: {},
    },
  });

  const features = await fetchBaselineFeatures(WINDOW, impl);

  assert.equal(features.length, 2);
  assert.deepEqual(features[0], {
    id: "sibling-count",
    name: "sibling-count() and sibling-index()",
    baselineDate: "2026-09-01",
    link: "https://webstatus.dev/features/sibling-count",
  });
  assert.equal(impl.calls.length, 2);
  assert.equal(
    impl.calls[0].searchParams.get("q"),
    "baseline_status:newly AND baseline_date:2026-08-31..2026-09-06",
  );
  assert.equal(impl.calls[1].searchParams.get("page_token"), "t2");
});

test("throws on a non-OK response", async () => {
  const impl = async () => ({ ok: false, status: 500 });
  await assert.rejects(
    () => fetchBaselineFeatures(WINDOW, impl),
    /webstatus\.dev returned 500/,
  );
});

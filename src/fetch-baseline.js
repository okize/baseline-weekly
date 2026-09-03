const API = "https://api.webstatus.dev/v1/features";

export async function fetchBaselineFeatures(window, fetchImpl = fetch) {
  const query =
    `baseline_status:newly AND baseline_date:${window.start}..${window.end}`;
  const features = [];
  let pageToken;
  do {
    const url = new URL(API);
    url.searchParams.set("q", query);
    if (pageToken) url.searchParams.set("page_token", pageToken);
    const res = await fetchImpl(url);
    if (!res.ok) throw new Error(`webstatus.dev returned ${res.status}`);
    const body = await res.json();
    for (const f of body.data ?? []) {
      features.push({
        id: f.feature_id,
        name: f.name,
        baselineDate: f.baseline?.low_date ?? null,
        link: `https://webstatus.dev/features/${f.feature_id}`,
      });
    }
    pageToken = body.metadata?.next_page_token;
  } while (pageToken);
  return features;
}

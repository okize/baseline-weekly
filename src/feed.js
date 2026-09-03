import { SITE_URL, escapeHtml } from "./html.js";

export function renderFeed(digests) {
  const items = digests.map((d) => {
    const url = `${SITE_URL}/archive/${d.date}.html`;
    const pubDate = new Date(`${d.date}T13:00:00Z`).toUTCString();
    return `    <item>
      <title>Baseline Weekly — ${escapeHtml(d.date)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(d.intro)}</description>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Baseline Weekly</title>
    <link>${SITE_URL}/</link>
    <description>Weekly digest of newly-Baseline web features and Node.js releases</description>
${items}
  </channel>
</rss>
`;
}

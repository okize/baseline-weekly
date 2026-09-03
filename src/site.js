import { renderDigestBody, renderPage, escapeHtml } from "./html.js";
import { renderFeed } from "./feed.js";

// digests: newest first
export function buildSite(digests) {
  const site = new Map();

  const archiveList = digests.map((d) =>
    `<li><a href="archive/${escapeHtml(d.date)}.html">Week of ${escapeHtml(d.date)}</a></li>`,
  ).join("\n");

  const [latest] = digests;
  const indexBody = [
    renderDigestBody(latest),
    "<h2>Archive</h2>",
    `<ul>${archiveList}</ul>`,
  ].join("\n");
  site.set("index.html", renderPage("Baseline Weekly", indexBody));

  for (const d of digests) {
    site.set(
      `archive/${d.date}.html`,
      renderPage(`Baseline Weekly — ${d.date}`, renderDigestBody(d)),
    );
  }

  site.set("feed.xml", renderFeed(digests));
  return site;
}

export const SITE_URL = "https://okize.github.io/baseline-weekly";

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const STYLE = `
  body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem;
         font: 16px/1.6 system-ui, sans-serif; color: #1a1a1a; }
  h1 { font-size: 1.5rem; } h2 { font-size: 1.2rem; margin-top: 2rem; }
  h3 { font-size: 1rem; margin-bottom: 0.2rem; }
  h3 + p { margin-top: 0.2rem; }
  a { color: #0b57d0; }
  .meta { color: #555; font-size: 0.85rem; }
  details { margin: 0.5rem 0 1rem; } pre { overflow-x: auto; }
  footer { margin-top: 3rem; font-size: 0.85rem; color: #555; }
`;

export function renderPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="alternate" type="application/rss+xml" title="Baseline Weekly" href="${SITE_URL}/feed.xml">
<style>${STYLE}</style>
</head>
<body>
${body}
<footer>
  <p><a href="${SITE_URL}/">Baseline Weekly</a> ·
     <a href="${SITE_URL}/feed.xml">RSS</a> ·
     <a href="https://github.com/okize/baseline-weekly">source</a></p>
</footer>
</body>
</html>
`;
}

export function renderDigestBody(digest) {
  const parts = [`<h1>Week of ${escapeHtml(digest.date)}</h1>`];
  parts.push(`<p>${escapeHtml(digest.intro)}</p>`);

  if (digest.web.length === 0 && digest.node.length === 0) {
    parts.push("<p>Nothing new this week.</p>");
    return parts.join("\n");
  }

  if (digest.web.length > 0) {
    parts.push("<h2>Newly Baseline</h2>");
    for (const f of digest.web) {
      parts.push(`<h3><a href="${escapeHtml(f.link)}">${escapeHtml(f.name)}</a></h3>`);
      parts.push(`<p class="meta">Baseline since ${escapeHtml(f.baselineDate ?? "unknown")}</p>`);
      if (f.blurb) parts.push(`<p>${escapeHtml(f.blurb)}</p>`);
    }
  }

  if (digest.node.length > 0) {
    parts.push("<h2>Node.js releases</h2>");
    for (const r of digest.node) {
      parts.push(`<h3><a href="${escapeHtml(r.link)}">Node.js ${escapeHtml(r.version)} (${escapeHtml(r.line)})</a></h3>`);
      parts.push(`<p class="meta">Released ${escapeHtml(r.date)}</p>`);
      if (r.blurb) parts.push(`<p>${escapeHtml(r.blurb)}</p>`);
      if (r.notableChanges) {
        parts.push(
          `<details><summary>Notable changes</summary><pre>${escapeHtml(r.notableChanges)}</pre></details>`,
        );
      }
    }
  }
  return parts.join("\n");
}

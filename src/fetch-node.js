const INDEX = "https://nodejs.org/dist/index.json";

export async function fetchNodeReleases(window, fetchImpl = fetch) {
  const res = await fetchImpl(INDEX);
  if (!res.ok) throw new Error(`nodejs.org index returned ${res.status}`);
  const releases = (await res.json())
    .filter((r) => r.date >= window.start && r.date <= window.end);

  const out = [];
  for (const r of releases) {
    const version = r.version.replace(/^v/, "");
    const major = version.split(".")[0];
    const changelogUrl =
      `https://raw.githubusercontent.com/nodejs/node/main/doc/changelogs/CHANGELOG_V${major}.md`;
    const clRes = await fetchImpl(changelogUrl);
    if (!clRes.ok) {
      throw new Error(`changelog for v${major} returned ${clRes.status}`);
    }
    out.push({
      version,
      date: r.date,
      line: r.lts ? `LTS (${r.lts})` : "Current",
      security: Boolean(r.security),
      notableChanges: extractNotableChanges(await clRes.text(), version),
      link: `https://github.com/nodejs/node/releases/tag/v${version}`,
    });
  }
  return out;
}

// The trailing space after the version guards against prefix matches
// (26.8.1 must not match the 26.8.10 heading).
export function extractNotableChanges(changelog, version) {
  const lines = changelog.split("\n");
  const start = lines.findIndex(
    (l) => l.startsWith("## ") && l.includes(`Version ${version} `),
  );
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) { end = i; break; }
  }
  const section = lines.slice(start + 1, end);

  const nStart = section.findIndex((l) => l.trim() === "### Notable Changes");
  if (nStart === -1) return null;
  let nEnd = section.length;
  for (let i = nStart + 1; i < section.length; i++) {
    if (section[i].startsWith("### ")) { nEnd = i; break; }
  }
  const notes = section.slice(nStart + 1, nEnd).join("\n").trim();
  return notes || null;
}

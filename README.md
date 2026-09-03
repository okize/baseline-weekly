# baseline-weekly

Weekly digest of web platform features that just became
[Baseline](https://web-platform-dx.github.io/web-features/) (usable in all
major browsers) and new Node.js releases. Blurbs are written by Claude.

**Read it:** https://okize.github.io/baseline-weekly ·
[RSS](https://okize.github.io/baseline-weekly/feed.xml)

## How it works

A GitHub Action runs every Monday (`.github/workflows/weekly.yml`):

1. `src/fetch.js` — queries the [webstatus.dev](https://webstatus.dev) API and
   [nodejs.org](https://nodejs.org/dist/index.json) for the past week, writes
   `data/<date>.json`.
2. `src/curate.js` — Claude writes a blurb per item, writes
   `digests/<date>.json`. If the API call fails, the digest publishes
   uncurated.
3. `src/render.js` — builds the static site and RSS feed from `digests/`.
4. Deploys to GitHub Pages.

## Local development

```bash
npm install
npm test          # unit tests, no network
node src/render.js  # rebuild site/ from committed digests, no API key needed
```

Design docs live in `docs/superpowers/`.

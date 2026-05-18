# CloakBrowser Integration for Web-Science Digest

*Created: 2026-05-18 11:25:00 IST*
*Last Updated: 2026-05-18 11:25:00 IST*
*Related Task: [T8](../tasks/T8.md)*

## Overview

Integrates CloakBrowser (a stealth Chromium wrapper) into the cron-digests pipeline to generate web-science digests from Phys.org and ScienceDaily. These sites employ bot detection that blocks standard headless browsers. CloakBrowser provides a realistic browser fingerprint that passes all detection checks.

## Problem

1. **Bot detection blocks headless browsers:** Both Phys.org and ScienceDaily serve CAPTCHAs or blank pages to headless Chromium.
2. **VPS has no display server:** Standard headed mode requires a graphical environment; VPS is headless.
3. **ScienceDaily URL changed:** The previously known URL `https://www.sciencedaily.com/news/physics/` returns 404.
4. **Selector drift:** Article containers and headline selectors differ between sources and change over time.
5. **ScienceDaily summaries not in index:** Article summaries require visiting each individual article page; the index page only shows titles.

## Solution

### Headed Mode with Xvfb

On a headless VPS, `xvfb-run` provides a virtual framebuffer that CloakBrowser uses as its display:

```bash
xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' \
  node scripts/generate-web-science-cloak.mjs
```

This presents a realistic 1280x720 display to the browser, which passes bot.sannysoft.com with 0 red flags.

### CloakBrowser Fingerprint

The stealth Chromium presents:
- **OS:** Windows 10/11
- **GPU:** NVIDIA GeForce RTX 4060
- **Plugins:** 5 (Chrome PDF Viewer, Native Client, etc.)
- **WebGL Vendor/Renderer:** NVIDIA / ANGLE
- **User-Agent:** Standard Chrome Windows UA
- **No `navigator.webdriver` flag**

### ScienceDaily URL and Selector Fix

| Aspect | Old (Broken) | New (Working) |
|--------|-------------|---------------|
| URL | `/news/physics/` | `/news/matter_energy/physics/` |
| Status | 404 | 200 |
| Selector | `#headlines h3` / `.headline` | `a[href*="/releases/2026/"]` |
| Structure | Nested headline containers | Flat `<a>` tags |

### Per-Article Summary Fetching

For ScienceDaily, the script visits each article page and extracts:
1. `.lead` class content (primary)
2. `<meta name="description">` (fallback)
3. First paragraph after the headline (fallback 2)

### Physics Keyword Scoring

Articles are scored for relevance using a weighted keyword dictionary:
- **High weight (3):** quantum gravity, string theory, black hole, gravitational wave
- **Medium weight (2):** quantum, entanglement, superconductor, Higgs, dark matter
- **Low weight (1):** photon, laser, optical, nuclear, atomic

Top-scoring articles are selected for the digest.

### Tag Assignment Engine

Tags are assigned based on content analysis rather than source defaults:
- "quantum" + "gravity" → `Quantum Gravity`
- "optics" / "photon" / "laser" → `Optics & Photonics`
- "superconductor" → `Superconductivity`
- "entanglement" → `Quantum Entanglement`
- "black hole" → `Black Holes`
- Default: `General Physics`

## Implementation Details

### Script Architecture

```
scripts/generate-web-science-cloak.mjs
├── import cloakbrowser + playwright-core
├── __dirname from fileURLToPath (portable paths)
├── CONFIG object (URLs, selectors, session size)
├── main()
│   ├── launch CloakBrowser with xvfb
│   ├── fetchPhysOrgArticles(browser)
│   │   ├── navigate to URL
│   │   ├── wait for selector (with timeout)
│   │   ├── extract articles (multi-selector fallback)
│   │   └── return array of {title, url, summary, source}
│   ├── fetchScienceDailyArticles(browser)
│   │   ├── navigate to URL
│   │   ├── extract article links
│   │   ├── visit each article page for summary
│   │   └── return array of {title, url, summary, source}
│   ├── scoreArticles(articles)
│   │   └── keyword matching + weight calculation
│   ├── selectTopArticles(scored, count)
│   │   └── sort by score, deduplicate by title
│   ├── assignTags(article)
│   │   └── content-based tag assignment
│   ├── generateDigest(selected)
│   │   └── markdown output with v2.0 format
│   ├── updateManifest(date, type)
│   │   └── append entry to manifest.json
│   └── validateAndSave(digest)
│       └── write to web-science/YYYY-MM-DD.md
└── cleanup: close browser
```

### Key Code Snippets

**Launch with xvfb (scripted):**
```javascript
const browser = await chromium.launch({
  headless: false,  // MUST be false for CloakBrowser stealth
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
```

The script is designed to be called via `xvfb-run` wrapper:
```bash
#!/bin/bash
export DISPLAY=:99
Xvfb :99 -screen 0 1280x720x24 &
node scripts/generate-web-science-cloak.mjs
```

**Phys.org multi-selector fallback:**
```javascript
const selectors = [
  'article.sorted-article h2 a',
  '.news-article h2 a',
  '.sorted-article a[href*="/news/"]',
];
let articles = [];
for (const selector of selectors) {
  articles = await page.locator(selector).all();
  if (articles.length > 0) break;
}
```

**ScienceDaily article extraction:**
```javascript
const links = await page.locator('a[href*="/releases/2026/"]').all();
for (const link of links.slice(0, 12)) {
  const url = await link.getAttribute('href');
  // Visit each article page for summary
  const articlePage = await browser.newPage();
  await articlePage.goto(`https://www.sciencedaily.com${url}`);
  const summary = await articlePage.locator('.lead').textContent()
    || await articlePage.locator('meta[name="description"]').getAttribute('content');
}
```

**Keyword scoring:**
```javascript
const KEYWORDS = {
  'quantum gravity': 3, 'string theory': 3, 'black hole': 3,
  'gravitational wave': 3, 'quantum': 2, 'entanglement': 2,
  'superconductor': 2, 'Higgs': 2, 'dark matter': 2,
  'photon': 1, 'laser': 1, 'optical': 1, 'nuclear': 1,
};

function scoreArticle(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  let score = 0;
  for (const [keyword, weight] of Object.entries(KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) score += weight;
  }
  return score;
}
```

## Files Created/Modified

- **Created:** `scripts/generate-web-science-cloak.mjs` — Main digest generator
- **Modified:** `web-science/2026-05-18.md` — First CloakBrowser-generated digest
- **Modified:** `web-science/manifest.json` — Added 2026-05-18 entry

## Dependencies

- `cloakbrowser` (npm) — Stealth Chromium wrapper
- `playwright-core` (npm) — Browser automation (required by CloakBrowser)
- `xvfb` (system package) — Virtual framebuffer for headed mode on headless VPS

## Security Notes

1. **No secrets in script:** The script contains no API keys, tokens, or credentials.
2. **No external network calls beyond fetching:** Only fetches article pages from Phys.org and ScienceDaily.
3. **Xvfb runs ephemerally:** The virtual display is created per-run and cleaned up after.
4. **CloakBrowser binary:** ~206 MB Chromium downloaded to `~/.cloakbrowser/`. Not committed to repo.

## Related Tasks

- [T8: CloakBrowser Integration](../tasks/T8.md)
- [T6: Schema, Validation, and Index Infrastructure](../tasks/T6.md) — Validation that the generated digest must pass

## Future Work

- [ ] Integrate CloakBrowser into the cron job message so the agent uses it automatically
- [ ] Add retry logic with exponential backoff for transient failures
- [ ] Cache article metadata to reduce redundant fetches
- [ ] Consider Playwright stealth plugins as lighter alternative to full CloakBrowser

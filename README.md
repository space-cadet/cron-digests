# Cron Digests

A running archive of automated daily digests — arXiv papers and web science news — delivered to Telegram and browsable in a web viewer.

## Digests

### arXiv Morning Digest
- **Schedule:** 7:11 AM IST, Monday–Friday
- **Categories:** hep-th, gr-qc, quant-ph, cond-mat
- **Focus:** Quantum gravity, loop quantum gravity, string theory, quantum computing, black hole thermodynamics, quantum cosmology, condensed matter, social physics
- **Archive:** [`arxiv/`](arxiv/)

### Web Science Digest
- **Schedule:** 10:17 AM IST, Monday–Friday
- **Sources:** Phys.org + ScienceDaily (via CloakBrowser stealth fetch)
- **Archive:** [`web-science/`](web-science/)

## Format

Each digest is saved as `YYYY-MM-DD.md` in its respective folder. Files follow a standard template with ranked items, URLs, relevance notes, and **subject tags**.

### Entry Template

```markdown
## N. [Paper/Article Title]
- **Authors:** ...
- **arXiv ID:** ... (arxiv only)
- **URL:** ...
- **Categories:** ... (arxiv only)
- **Tags:** Tag1, Tag2, Tag3
- **Relevance:** 🔥 High — ...
```

### Available Tags

Tags are assigned at generation time by the digest curator. Common tags include:

| Tag | Typical Content |
|-----|----------------|
| Quantum Gravity | Loop quantum gravity, string theory, CDT, emergent spacetime |
| Black Hole Physics | Thermodynamics, information paradox, evaporation, holography |
| Quantum Information & Computing | Qubits, error correction, algorithms, quantum supremacy |
| Cosmology & Early Universe | Inflation, CMB, dark energy, quantum cosmology |
| Field Theory & Mathematical Physics | QFT, CFT, topological field theory, math methods |
| Many-Body Physics & Condensed Matter | Strongly correlated systems, superconductivity, topological phases |
| Phase Transitions & Critical Phenomena | Critical exponents, universality, RG flows |
| Gravitational Waves & Astrophysics | LIGO, pulsar timing, multimessenger astronomy |
| High-Energy Physics & Phenomenology | Beyond Standard Model, SUSY, collider physics |
| Foundations & Interpretations | Measurement problem, interpretations, quantum foundations |

New tags are added when needed and tracked in [`tags.json`](tags.json).

## Automation

Powered by [OpenClaw](https://openclaw.ai) cron jobs. The agent generates the digest, writes the file, commits, and pushes — all hands-off.

**Web Science Digest — CloakBrowser Integration**
- Direct `web_fetch` is blocked by APS News, Scientific American, and other major science sites
- Uses **CloakBrowser** (stealth Chromium via Playwright) with `xvfb-run` headed mode to bypass bot detection
- Fetches from **Phys.org** and **ScienceDaily** with physics keyword scoring and per-article summary extraction
- Fallback: if CloakBrowser fails, agent falls back to `web_fetch` for the same two sites and commits a partial digest rather than nothing
- Script: [`scripts/generate-web-science-cloak.mjs`](scripts/generate-web-science-cloak.mjs)

## CI/CD Pipeline

Every push to `main` triggers GitHub Actions:

1. **Validate** — `scripts/validate-digest.js` checks all digests for format compliance (headers, numbered entries, required fields, duplicate detection). Failures block deployment.
2. **Build Index** — `scripts/build-index.js` rebuilds `viewer/index.json` and `viewer/index.db` from all digests. Runs with `continue-on-error: true` so index build failures don't block deploy.
3. **Auto-Commit** — CI commits any new digest files pushed by cron agents, plus rebuilt index files, with `[ci skip]` to prevent infinite loops.
4. **Deploy** — `viewer/` directory is deployed to GitHub Pages.

**Key design decisions:**
- Two-job architecture: `validate-and-index` → `deploy` (deploy only runs if validation passes)
- CI stages **ALL changes** (`arxiv/`, `web-science/`, `viewer/`) not just index files — cron-pushed digests get committed even if index build fails
- `[ci skip]` in auto-commit messages prevents infinite CI loops
- Minimal permissions: `contents:write`, `pages:write`, `id-token:write`

Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Viewer

Browse digests in a web interface: **[Live Viewer](https://space-cadet.github.io/cron-digests/viewer/)**

- Chronological card grid (latest first)
- **Tag filtering** — click any tag chip (top bar or per-card) to filter; click again to clear
- **Dark mode** toggle with persistence
- **"New" badge** on the latest digest
- **Keyboard navigation** — `j`/`k` to navigate cards, `Enter` to open, `Esc` to close
- **arXiv links** redirect through arxivite.org for enhanced PDF viewing
- Search across titles and content
- Works on mobile

The viewer loads `viewer/index.json` instantly instead of fetching N markdown files separately.

## Architecture

```
cron-digests/
├── arxiv/                    # arXiv digest markdown files
├── web-science/              # Web science digest markdown files
├── viewer/
│   ├── index.html            # Single-page viewer app
│   ├── index.json            # Built index (all digests + entries + tags)
│   └── index.db              # SQLite index (for local querying)
├── scripts/
│   ├── validate-digest.js    # Format validator (CI gate)
│   ├── build-index.js        # Index builder (CI + manual)
│   └── generate-web-science-cloak.mjs  # CloakBrowser fetch script
├── .github/workflows/ci.yml   # GitHub Actions pipeline
├── tags.json                 # Tag registry
└── README.md                 # This file
```

## Scripts

### Validate Digests
```bash
node scripts/validate-digest.js
```

### Rebuild Index
```bash
node scripts/build-index.js
```

### Generate Web Science Digest (Manual)
```bash
xvfb-run --auto-servernum --server-args='-screen 0 1280x720x24' \
  node scripts/generate-web-science-cloak.mjs
```

---

*Last updated: 2026-05-21*

# Validation and Indexing

*Created: 2026-05-21 16:45:00 IST*
*Last Updated: 2026-08-26 10:46:00 IST*
*Related Tasks: [T6](../tasks/T6.md), [T10](../tasks/T10.md)*

## Overview

`scripts/validate-digest.js` and `scripts/build-index.js` form the data integrity layer of the cron-digests system. Validation runs as a CI gate; the index builder generates the viewer's data files.

## Validator (`validate-digest.js`)

### What It Checks

1. **Title format** — `# [Type] Digest — YYYY-MM-DD`
2. **Header fields** — Categories/Sites, Items found, Focus
3. **Entry numbering** — Sequential `## N. Title` with no gaps
4. **No unnumbered sections between entries** — Any `##` without a number is an error
5. **Required per-entry fields** — Summary, Source, Why it matters/Tags, URL
6. **Duplicate detection** — Same URL or title across entries
7. **Items found accuracy** — Header `items_found` must match actual entry count

### arxiv Exception (2026-05-21)

**Problem:** arxiv digests report total announcement size in `items_found` (e.g., 288) but only include selected papers as entries (e.g., 15). Validator flagged this as an error.

**Fix:** Skip `items_found` accuracy check for `digestType === 'arxiv'`.

```javascript
if (digestType !== 'arxiv') {
  // Only check items_found for non-arxiv digests
}
```

**Rationale:** arxiv digests intentionally filter ~300 announcements down to 10-20 relevant papers. The header reports the raw feed size for context; entries are the curated subset.

## Index Builder (`build-index.js`)

### Moltbook Provenance Rules

Moltbook public digests are generated only from structured records returned by `scripts/moltbook-client.mjs`. The client queries `/submolts/{name}/feed`, requires an exact returned submolt match, validates a `moltbook.com` URL, and normalizes ID, author, timestamp, title, content, and counts. Duplicate posts are removed before generation. The old freeform `moltbook-research.md` parser is retired.

If no valid posts are available, the generator writes an explicit zero-item digest. It never recycles older posts or unrelated external research. Contaminated historical files are retained only as explicitly invalid records and are excluded from valid current research.

### What It Builds

- `viewer/index.json` — Flat JSON with all digests, entries, and tag statistics
- `viewer/index.db` — SQLite database for local querying (when `better-sqlite3` available)

### JSON Structure

```json
{
  "generated_at": "ISO timestamp",
  "digests": [
    {
      "date": "2026-05-21",
      "type": "web-science",
      "title": "Web Science Digest — 2026-05-21",
      "sites": "Phys.org + ScienceDaily",
      "items_found": 6,
      "focus": "Quantum sensors, spin glass...",
      "entries": [...]
    }
  ],
  "stats": {
    "total_digests": 20,
    "total_entries": 340,
    "unique_tags": { "quantum gravity": { "first_seen": "2026-05-11", "count": 12 } },
    "tag_counts": { "quantum gravity": 12 }
  }
}
```

### Fallback Behavior

If `better-sqlite3` is not installed (e.g., CI environment), the script falls back to JSON-only output. The viewer only needs `index.json`.

## CI Integration

Validator runs first in CI. If it fails, deploy is blocked. Index builder runs with `continue-on-error: true` so index build failures don't prevent digest files from being committed.

## Files

- `scripts/validate-digest.js` — Format validator
- `scripts/build-index.js` — Index builder
- `viewer/index.json` — Generated viewer data
- `viewer/index.db` — Generated SQLite (optional)

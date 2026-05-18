# Digest Format v2.0 — Implementation Details

## Overview

This document specifies the uniform digest format used by all cron-digest generators. The format ensures consistent rendering in the web viewer and enables reliable metadata extraction.

## Format Specification

### Header Block (required)

```markdown
# {Topic} Digest — YYYY-MM-DD
**Categories:** cat1, cat2, cat3     # for arXiv only
**Sites:** Site1 + Site2            # for web science only  
**Items found:** N
**Focus:** brief comma-separated topic summary
```

**Rules:**
- Date format: `YYYY-MM-DD` only — never "Monday, 11 May 2026"
- `**Items found:**` — bold format, actual count of entries
- `**Categories:**` — arXiv only, comma-separated arXiv category codes
- `**Sites:**` — web science only, format: "Site1 + Site2"
- `**Focus:**` — brief summary of main topics covered

### Entry Format (required)

```markdown
## N. Entry Title
- **Source:** Source Name / Author or Lab
- **URL:** https://...
- **Summary:** Brief description of the work
- **Relevance:** Why this matters to the audience
- **Tags:** Tag1, Tag2, Tag3
```

**Rules:**
- Always use `## N.` for entries — never `### N.`
- Entry numbers start at 1 and are sequential
- `**Tags:**` — 2-3 tags from the tag registry per entry
- No section headers (`## Section Name`) between entries
- Optional separator `---` between entries (for readability)

### arXiv-Specific Fields

```markdown
- **Authors:** A. Author, B. Author
- **arXiv ID:** 2605.XXXXX
- **Categories:** hep-th (cross-list gr-qc)
```

### Web Science-Specific Fields

```markdown
- **Source:** Phys.org / Lab Name
- **Published:** YYYY-MM-DD (if available)
```

## Tag Registry

Tags are tracked in `tags.json` with counts and first-seen dates. Current tags:

- Quantum Gravity
- Black Hole Physics
- Quantum Information & Computing
- Cosmology & Early Universe
- Field Theory & Mathematical Physics
- Many-Body Physics & Condensed Matter
- Phase Transitions & Critical Phenomena
- Gravitational Waves & Astrophysics
- High-Energy Physics & Phenomenology
- Foundations & Interpretations
- Science Communication & Policy
- Experiment & Observation
- Technology & Engineering
- Optics & Photonics

**Tagging rules:**
- Be specific but not overly narrow
- If work spans multiple areas, assign multiple tags
- If no existing tag fits, create a new one and add to `tags.json`

## File Locations

- **Template spec:** `cron-digests/TEMPLATE.md`
- **Reformat script:** `cron-digests/reformat-digest.js`
- **Tag registry:** `cron-digests/tags.json`
- **JSON Schema:** `cron-digests/schema/digest.json`
- **Validation script:** `cron-digests/scripts/validate-digest.js`
- **Index builder:** `cron-digests/scripts/build-index.js`
- **arXiv digests:** `cron-digests/arxiv/YYYY-MM-DD.md`
- **Web science digests:** `cron-digests/web-science/YYYY-MM-DD.md`

## Validation and Indexing

### Automated Validation
Run `node scripts/validate-digest.js` to check all digests:
- `**Items found:** N` matches actual entry count
- Entries are sequentially numbered `## 1.` through `## N.`
- No unnumbered `##` section headers inside entries (flags structural drift)
- Old footers using `###` are treated as body content, not violations

**Status:** 11 files checked, 0 errors (as of 2026-05-18)

### Index Generation
Run `node scripts/build-index.js` to rebuild:
- `viewer/index.db` — SQLite with digests, entries, tags tables
- `viewer/index.json` — pre-computed JSON for instant viewer loading

Current index: **11 digests, 106 entries, 93 unique tags**

### Schema
`schema/digest.json` formalizes the de-facto v2.0 format:
- Header: title, date, type, categories|sites, items_found, focus
- Entry: number, title, authors|source, arxiv_id, url, categories, summary, relevance, tags[]

Note: `TEMPLATE.md` specifies `**Source:**` but actual arXiv digests use `**Authors:**`, `**arXiv ID:**`, etc. The schema captures the actual format used.

## Viewer Integration

The viewer at `viewer/index.html` expects:
- `**Items found:** N` for item count display
- `**Categories:**` or `**Sites:**` for card metadata
- `## N. Title` for entry extraction (ToC + preview)
- `**Tags:**` for category chips

**Performance:** Viewer loads `index.json` in one fetch instead of N markdown files.

## Migration Notes

- Old format with `### N.` entries: run `node reformat-digest.js input.md output.md type`
- Old format with `## Section` headers: script auto-removes section headers
- Date format inconsistencies: script normalizes to `YYYY-MM-DD`
- Footer sections (`## Honorable Mentions`, `## Notable Omissions`): convert to `###` to pass validation

## Cron Job Integration

Both cron jobs (arXiv and Web Science) include in their prompts:
1. Reference to this template
2. Instructions to write to correct directory
3. Instructions to update `tags.json`
4. Instructions to commit with dated message
5. Instructions to update `manifest.json`

---

*Last updated: 2026-05-18*

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
- **arXiv digests:** `cron-digests/arxiv/YYYY-MM-DD.md`
- **Web science digests:** `cron-digests/web-science/YYYY-MM-DD.md`

## Viewer Integration

The viewer at `viewer/index.html` expects:
- `**Items found:** N` for item count display
- `**Categories:**` or `**Sites:**` for card metadata
- `## N. Title` for entry extraction (ToC + preview)
- `**Tags:**` for category chips

## Migration Notes

- Old format with `### N.` entries: run `node reformat-digest.js input.md output.md type`
- Old format with `## Section` headers: script auto-removes section headers
- Date format inconsistencies: script normalizes to `YYYY-MM-DD`

## Cron Job Integration

Both cron jobs (arXiv and Web Science) include in their prompts:
1. Reference to this template
2. Instructions to write to correct directory
3. Instructions to update `tags.json`
4. Instructions to commit with dated message

---

*Last updated: 2026-05-12*

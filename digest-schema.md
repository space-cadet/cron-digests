# Digest Framework

A unified system for generating, archiving, and viewing periodic digests via OpenClaw cron jobs.

## Overview

The digest framework provides:
- **Consistent generation**: Every digest follows the same structure and metadata schema
- **Unified archive**: All digests live in one repo with predictable paths
- **Shared viewer**: One web interface renders any digest type
- **Tag registry**: Cross-cutting subject tags enable discovery across digest types
- **Memory bank integration**: Project context persists across sessions and agents

## Digest Types

| Type | ID Pattern | Schedule | Content Source |
|------|-----------|----------|----------------|
| arXiv Papers | `arxiv-YYYY-MM-DD` | 7:11 AM IST, Mon–Fri | arXiv API (hep-th, gr-qc, quant-ph, cond-mat) |
| Web Science News | `web-science-YYYY-MM-DD` | 10:17 AM IST, Mon–Fri | Rotating site pairs |
| GitHub Activity | `github-YYYY-MM-DD` | TBD | GitHub API (commits, issues, PRs) |
| *Add new types here* | | | |

## File Structure

```
cron-digests/
├── arxiv/
│   ├── 2026-05-10.md
│   ├── 2026-05-11.md
│   └── ...
├── web-science/
│   ├── 2026-05-10.md
│   ├── 2026-05-11.md
│   └── ...
├── github/
│   └── ... (future)
├── viewer/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tags.json              # Tag registry
├── digest-schema.md       # This document
└── README.md
```

## Digest Schema

Every digest file is a Markdown document with this structure:

```markdown
# [Digest Type] — YYYY-MM-DD
**Source:** [where content came from]
**Items found:** N
**Focus:** brief summary of day's themes

---

## 1. [Item Title]
- **Authors/Source:** ...
- **URL:** ...
- **Identifier:** ... (arxiv ID, issue #, etc. — optional)
- **Categories:** ... (source-specific — optional)
- **Tags:** Tag1, Tag2, Tag3
- **Relevance:** 🔥 High — 2-3 sentences explaining why this matters

---

## 2. [Next Item]
...
```

### Required Fields
- `Title` (## heading)
- `URL`
- `Tags` (2-3 subject tags)
- `Relevance` (🔥 High / Medium / Low + explanation)

### Optional Fields
- `Authors/Source`
- `Identifier` (arxiv ID, GitHub issue #, etc.)
- `Categories` (source-native categories)

## Tag System

### Starter Tags (Physics/Science)
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

### Starter Tags (General/Technical)
- Science Communication & Policy
- Experiment & Observation
- Technology & Engineering
- Software & Tools
- Open Source & Community

### Tag Rules
1. **Be specific but not overly narrow**: "Quantum Gravity" not "Loop Quantum Gravity on 3-Torus"
2. **Multiple tags allowed**: Cross-disciplinary work gets 2-3 tags
3. **Create new tags when needed**: If no existing tag fits, add one
4. **Document new tags**: Update `tags.json` with name, count, and first_seen date

### Tag Registry (`tags.json`)
```json
{
  "version": 1,
  "tags": [
    {"name": "Quantum Gravity", "count": 12, "first_seen": "2026-05-10"},
    {"name": "Black Hole Physics", "count": 8, "first_seen": "2026-05-10"}
  ],
  "last_updated": "2026-05-12",
  "merge_candidates": []
}
```

## Adding a New Digest Type

### 1. Create the cron job

Use the OpenClaw CLI:
```bash
openclaw cron add \
  --name "[Type] Digest" \
  --schedule "[cron expr]" \
  --timezone "Asia/Kolkata" \
  --target isolated \
  --message "Generate [type] digest per digest-schema.md. Write to code/cron-digests/[type]/YYYY-MM-DD.md. Update tags.json. Commit and push."
```

### 2. Create the archive folder

```bash
mkdir -p code/cron-digests/[type]
```

### 3. Add type-specific instructions

In the cron job's `message` or `system` prompt, include:
- Data source and query method
- Relevance criteria for this type
- Type-specific fields (if any)
- Any special handling

### 4. Update the viewer (if needed)

The viewer auto-detects digest types from folder names. If the new type needs special rendering, add a case in `viewer/app.js`.

### 5. Document in memory bank

Add the new type to the table in this file and update `activeContext.md`.

## Viewer Integration

The viewer at `viewer/index.html` reads:
1. `manifest.json` files in each type folder (lists available dates)
2. Individual `.md` digest files
3. `tags.json` for tag metadata

It renders:
- Chronological card grid (latest first)
- Search across titles, content, and tags
- Filter by digest type
- Filter by subject tag
- Modal for full digest reading

## Cron Job Template

```json
{
  "name": "[Type] Digest",
  "schedule": {
    "kind": "cron",
    "expr": "0 9 * * 1-5",
    "tz": "Asia/Kolkata"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Generate [type] digest following digest-schema.md.\n\nSteps:\n1. Fetch content from [source]\n2. Select 6-10 most relevant items\n3. For each: write title, URL, 2-3 tags, relevance note\n4. Write to code/cron-digests/[type]/YYYY-MM-DD.md\n5. Update code/cron-digests/tags.json\n6. Commit and push to origin main\n\nTag assignment rules: [specific to type]"
  },
  "delivery": {
    "mode": "announce",
    "channel": "telegram",
    "to": "849773381"
  }
}
```

## Memory Bank Integration

This framework is documented in:
- `digest-schema.md` (this file) — technical specification
- `README.md` — user-facing overview
- `activeContext.md` — current status and recent changes
- `tasks.md` — pending work and backlog

When modifying the framework, update all four files.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-12 | Initial framework with arXiv and Web Science digests, tag system, viewer |

---

*Part of the [cron-digests](https://github.com/space-cadet/cron-digests) project.*

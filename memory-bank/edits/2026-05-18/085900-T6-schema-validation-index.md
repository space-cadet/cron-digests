---
kind: edit_chunk
id: t6-schema-validation-index
created_at: 2026-05-18 08:59:00 IST
task_ids: [T6]
source_branch: main
source_commit: 6d6e4b5
---

#### 08:59:00 IST - T6: Schema, validation, and index infrastructure
- Created `schema/digest.json` - JSON Schema v7 for digest header and entry structure
- Created `scripts/validate-digest.js` - Markdown parser with items_found count check, sequential numbering validation 1..N, unnumbered ## section header flagging
- Created `scripts/build-index.js` - Digest parser populating SQLite DB and exporting viewer/index.json
- Created `viewer/index.db` - SQLite index with digests, entries, tags tables and indexes
- Created `viewer/index.json` - Pre-computed JSON index (11 digests, 106 entries, 93 unique tags)
- Modified `arxiv/2026-05-11.md` - Converted `## Honorable Mentions` footer to `###` to pass validation
- Modified `web-science/2026-05-13.md` - Converted `## Notable Omissions` and `## Methodology` to `###` to pass validation

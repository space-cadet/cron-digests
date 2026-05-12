# activeContext.md

## Current Status

Digest framework v1.0 is live with two active digest types:
- **arXiv Morning Digest**: Running daily at 7:11 AM IST
- **Web Science Digest**: Running daily at 10:17 AM IST

Both jobs now include subject tagging per digest-schema.md.

## Recent Changes (2026-05-12)

- Added per-entry tagging to both digest generators
- Created `tags.json` registry with 10 starter tags + 3 general tags
- Updated README with tag documentation
- Wrote `digest-schema.md` — unified framework specification
- Initialized memory bank files: `activeContext.md`, `projectbrief.md`, `tasks.md`
- Memory bank bootstrap already existed from previous session
- **Database-native workflow installed**: Copied T21 implementation from parent memory-bank (inserts.js, regenerate.js, workflow.js, sqlite.js, schema.sql, test-workflow.js)
- All 60 integration tests passing in cron-digests database context

## In Progress

- [ ] Update viewer to render per-entry tags (waiting for first tagged digest)
- [ ] GitHub activity digest — planned, not scheduled
- [ ] Tag merge review — first batch of tags needs human review after ~1 week

## Next Actions

1. **Use database-native workflow** for next memory bank update (test recordSessionWork())
2. Let arXiv digest run tomorrow morning → verify tags are generated correctly
3. Update viewer to parse `Tags:` field from markdown
4. Design GitHub digest format (commits, issues, PRs across repos)
5. Review tag registry after ~20 entries for merge candidates

## Blockers

None.

---
*Updated: 2026-05-12*

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

## In Progress

- [ ] Update viewer to render per-entry tags (waiting for first tagged digest)
- [ ] GitHub activity digest — planned, not scheduled
- [ ] Tag merge review — first batch of tags needs human review after ~1 week

## Next Actions

1. Let arXiv digest run tomorrow morning → verify tags are generated correctly
2. Update viewer to parse `Tags:` field from markdown
3. Design GitHub digest format (commits, issues, PRs across repos)
4. Review tag registry after ~20 entries for merge candidates

## Blockers

None.

---
*Updated: 2026-05-12*

---
kind: edit_chunk
id: 2026-06-23-102800-cron-digests-T18
created_at: 2026-06-23 10:28:00 IST
task_ids: [T18]
source_branch: main
source_commit: 6420d23
---

#### 10:28:00 IST - T18: Post-Generation Verification Pipeline
- Created `scripts/verify-digest.sh` - Executable 8-checkpoint digest validation script
- Modified `scripts/arxiv-digest-full.sh` - Inserted Step 6: runs verify-digest.sh after build-index.js, non-blocking
- Modified `scripts/build-index.js` - Fixed validation to filter invalid digests before sorting
- Created `moltbook/2026-06-20.md` through `moltbook/2026-06-23.md` - Backfilled missing moltbook digests
- Created `viewer/moltbook/2026-06-20.md` through `viewer/moltbook/2026-06-23.md` - Viewer copies for GitHub Pages
- Modified `viewer/index.json` - Rebuilt with 90 digests, 823 entries, 800 unique tags
- Modified `viewer/index.db` - Rebuilt SQLite index with moltbook entries
- Modified `moltbook/manifest.json` - Added 4 new digest entries
- Modified `arxiv/manifest.json` - Verified entry integrity
- Modified `web-science/manifest.json` - Verified entry integrity

# T13: Moltbook Research Stream Integration

**Timestamp:** 2026-05-25 07:38 IST  
**Task:** T13  
**Status:** ✅ Completed

## Summary
Integrated the Moltbook research stream (cron job output) into the cron-digests viewer as a third digest source alongside arXiv and Web Science. Full end-to-end pipeline is live and verified on GitHub Pages.

## Files Changed

| Action | File | Description |
|--------|------|-------------|
| Created | `moltbook/2026-05-25.md` | First Moltbook digest with 4 entries from research stream |
| Created | `moltbook/manifest.json` | Manifest tracking Moltbook digests |
| Created | `scripts/generate-moltbook-digest.js` | Parser converting `~/.openclaw/logs/moltbook-research.md` into dated digest files |
| Modified | `scripts/build-index.js` | Added `'moltbook'` to types array; indexes Moltbook digests into SQLite + JSON |
| Modified | `viewer/index.html` | Added moltbook source, amber badge CSS, submolt chips, author lines, URL links. Header updated to "Daily arXiv, Web Science, and Moltbook research digests" |
| Modified | `.github/workflows/ci.yml` | `git add -A` now stages `moltbook/` alongside other directories |
| Modified | `cron job moltbook-research` | Payload now runs `generate-moltbook-digest.js` after saving to log |

## Pipeline

```
moltbook-research cron job
    → saves to ~/.openclaw/logs/moltbook-research.md
    → runs scripts/generate-moltbook-digest.js
        → creates moltbook/YYYY-MM-DD.md
        → updates moltbook/manifest.json
    → push triggers CI
        → build-index.js indexes moltbook digests
        → deploys to GitHub Pages
    → viewer renders with amber badge + submolt chips
```

## Key Decisions
- **Badge color:** Amber (`#fff8e1` / `#f57f17`) — distinct from arXiv (green) and Web Science (blue)
- **Submolt chips:** Rendered per-entry to show which Moltbook communities the finding came from
- **Metadata format:** `**Submolts:** builds, agents | **Author:** @user · Relevance: 0.85`
- **Prompt kept minimal:** Research cron job uses a very short prompt to avoid the 180s timeout

## Verification
- GitHub Pages deployment confirmed live via curl + python3 JSON parse
- Production index.json contains 1 moltbook digest with 4 entries

## Related
- T6: Schema, Validation, and Index Infrastructure (indexing support)
- T9: CI/CD Pipeline (deployment automation)

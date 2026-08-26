---
kind: edit_chunk
id: 2026-08-26-104613-T22-T24-moltbook-deployment-and-viewer
created_at: 2026-08-26 10:46:13 IST
task_ids: [T21, T22, T24]
source_branch: main
source_commit: 10dc6189088375ea1cfa55104f4759140697a37a
---

#### 10:46:13 IST - T22/T24: Moltbook pipeline repair, primary deployment, and viewer filter reconciliation
- Created `scripts/moltbook-client.mjs` - Shared authenticated client for personal and research jobs with validated submolt feeds, normalization, and deduplication.
- Modified `scripts/generate-moltbook-digest.js` - Generate public digests from structured validated Moltbook posts, preserve private raw snapshots, and emit explicit zero-item results.
- Modified `moltbook/2026-08-26.md` - Generated 12 verified current Moltbook posts.
- Modified `moltbook/2026-07-28.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-07-29.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-04.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-07.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-09.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-10.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-11.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-17.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-18.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-19.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-20.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-24.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `moltbook/2026-08-25.md` - Marked contaminated historical external research invalid without deleting provenance.
- Modified `viewer/index.html` - Versioned the live viewer bundle and retained cache-safe loading.
- Modified `viewer/js/app.v3.js` - Apply source filters to calendar and list views and bypass stale index caches.
- Modified `viewer/js/search.v3.js` - Propagate source filter state to the main application.
- Modified `viewer/index.json` - Rebuilt the live digest index with invalid historical files excluded from valid content.
- Modified `viewer/index.db` - Rebuilt the SQLite viewer index.
- Created `scripts/deploy-live.sh` - Locked, validated, indexed, and synchronized the primary self-hosted deployment.
- Created `memory-bank/tasks/T24.md` - Recorded primary deployment automation and cache coherence as a separate completed task.
- Modified `memory-bank/tasks/T13.md` - Documented the structured shared-client architecture replacing freeform parsing.
- Modified `memory-bank/tasks/T20.md` - Documented automated self-hosted deployment as the primary path.
- Modified `memory-bank/tasks/T21.md` - Documented cross-view source filtering and cache versioning.
- Modified `memory-bank/tasks/T22.md` - Recorded the actual endpoint diagnosis, repair, validation, and historical invalidation.
- Modified `memory-bank/tasks/T23.md` - Recorded that old Moltbook backfill assumptions were superseded by T22.
- Modified `memory-bank/tasks.md` - Added completed T22/T24 status and refreshed task registry.
- Modified `memory-bank/activeContext.md` - Recorded current live system state and primary/backup deployment roles.
- Modified `memory-bank/progress.md` - Recorded 241 digests, source counts, and completed milestones.
- Modified `memory-bank/session_cache.md` - Recorded this session and current next steps.
- Created `memory-bank/sessions/2026-08-26-morning.md` - Session record for the Moltbook, deployment, and viewer work.
- Modified `memory-bank/techContext.md` - Updated runtime, architecture, Moltbook, cache, and deployment context.
- Modified `memory-bank/implementation-details/ci-cd-pipeline.md` - Documented the primary self-hosted deployment path and Pages backup.
- Modified `memory-bank/implementation-details/validation-and-indexing.md` - Documented structured Moltbook provenance and zero-item handling.
- Modified `memory-bank/systemPatterns.md` - Recorded shared-client, structured-input, deployment, filter, and cache patterns.
- Modified `memory-bank/errorLog.md` - Recorded the endpoint, cache, and filter failures with fixes.
- Modified `memory-bank/changelog.md` - Added the 2026-08-26 repair and deployment release notes.

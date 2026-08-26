# Product Context

## Overview
**cron-digests** — A searchable, filterable archive of daily arXiv, Web Science, and verified Moltbook research digests.

## User Context
- **Target users**: Deepak and research readers tracking physics, quantum gravity, AI, and related science.
- **Key workflows**: Scheduled feed collection, validated digest generation, unified viewer search/filtering, and direct source links.
- **Pain points**: Feed drift, stale browser/index caches, malformed source data, and inconsistent deployment between repository and primary website.

## Product Decisions
- **Self-hosted site is primary**: `quantumofgravity.com/cron-digests/` is the authoritative public deployment; GitHub Pages is retained as backup.
- **Structured source data before publication**: Moltbook posts must come from validated API records; no historical freeform log is allowed to become public digest content.
- **Explicit zero-item results**: Missing source content is represented honestly rather than filled with stale or unrelated entries.
- **Shared feed infrastructure**: Moltbook personal and research jobs share authentication, transport, endpoint resolution, validation, deduplication, and logging.

## Related
- [Project brief](projectbrief.md)
- [Technical context](techContext.md)
- [Deployment task](tasks/T24.md)

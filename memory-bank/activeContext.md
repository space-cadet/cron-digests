# Active Context

*Last Updated: 2026-05-11*

## Current Focus

Viewer UI improvements completed. Both digest formats (arXiv + web-science) rendering correctly with per-paper category chips and working ToC navigation.

## System State

- **Gateway**: Running (port 18789)
- **Telegram**: Connected (user 849773381)
- **Kimi-claw**: Mode switched to `chat` (working)
- **Cron scheduler**: Enabled, next wake at 7:11 AM IST tomorrow
- **GitHub**: `gh` authenticated as `space_cadet`

## Active Decisions

1. Memory Bank protocol adopted for cron-digest project (self-contained)
2. Native OpenClaw memory for general chat/daily operations
3. Hybrid approach: structured docs for projects, lightweight for casual

## Today's Changes (2026-05-11)

### Viewer Improvements (viewer/index.html)
1. **Fixed ToC navigation** — `scrollToItem()` now targets `paper-${num}` IDs correctly
2. **Tightened spacing** — Reduced `.paper-item` margins (20→16px), list item gaps (4→2px), line-height (1.5→1.4)
3. **Per-paper category chips** — arXiv papers show categories (hep-th, gr-qc, etc.) inside each card
4. **Web-science format support** — Handles `### N. Title` under `## Section` headers, shows source chips ("arXiv", "Nature News")

### Commits
- `2977345` — Fix viewer: working ToC links, tighter spacing, category chips
- `7799d8c` — Fix viewer: per-paper category chips, web-science format support, tighter spacing

## Cross-References

- `projectbrief.md` — project overview
- `progress.md` — task tracking
- `../arxiv/2026-05-11.md` — first arXiv digest (manual run)
- `../web-science/2026-05-11.md` — first web-science digest (manual run)

## Current Considerations

- Need to verify cron jobs fire correctly on schedule (not just manual)
- Should document the corruption analysis from cloned workspace somewhere
- Viewer now handles both digest formats robustly

## Next Actions

- [ ] Test automated cron run (wait for tomorrow 7:11 AM)
- [ ] Document the memory-consolidation corruption findings
- [ ] Consider adding search/filter within modal view

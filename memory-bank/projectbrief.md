# Cron-Digest Memory Bank

*Created: 2026-05-11*  
*Last Updated: 2026-05-11*

## Project Brief

Automated daily digest system for arXiv and web science content. Two cron jobs run weekday mornings, generate digests, archive them as markdown files, and commit to a public GitHub repository.

## Repository

- **GitHub**: `github.com/space-cadet/cron-digests`
- **Local**: `/root/.openclaw/workspace/code/cron-digests/`

## Active Jobs

| Job | Schedule | Categories/Sites | Status |
|-----|----------|------------------|--------|
| arXiv Morning Digest | 7:11 AM IST, Mon–Fri | hep-th, gr-qc, quant-ph, cond-mat | ✅ Active |
| Web Science Digest | 10:17 AM IST, Mon–Fri | Rotating site pairs | ✅ Active |

## Archive Structure

```
cron-digests/
├── arxiv/
│   ├── README.md          (format guide)
│   └── YYYY-MM-DD.md      (daily digest)
└── web-science/
    ├── README.md          (site rotation schedule)
    └── YYYY-MM-DD.md      (daily digest)
```

## Site Rotation (Web Science)

| Day | Primary | Secondary |
|-----|---------|-----------|
| Monday | arXiv.org | Nature News |
| Tuesday | Phys.org | ScienceDaily |
| Wednesday | Quanta Magazine | MIT News |
| Thursday | APS News | Physics World |
| Friday | Scientific American | Space.com |

## Current Status

- ✅ Repository initialized and pushed
- ✅ Both cron jobs created and enabled
- ✅ Archive format defined
- ✅ Git commit automation in job messages
- 🔄 Awaiting first automated run (jobs fire tomorrow)

## Decisions

1. **Flat file archive** — one markdown file per day, never append. Atomic, git-friendly.
2. **Public repo** — `space-cadet/cron-digests` for easy sharing.
3. **Off-peak scheduling** — 7:11 and 10:17 to avoid :00/:30 congestion.
4. **Isolated sessions** — cron jobs run in subagents, not main session.

## Next Actions

- [ ] Verify first automated run produces correct output
- [ ] Add error handling for failed fetches
- [ ] Consider adding email/notification on failure
- [ ] Evaluate if digest quality meets needs after 1 week

## Notes

- arXiv digest focuses on: quantum gravity, loop quantum gravity, string theory, quantum computing, black hole thermodynamics, quantum cosmology, condensed matter, social physics
- Web science digest rotates pairs daily to avoid hitting same sources repeatedly
- Both jobs write to local filesystem then git commit; delivery is via Telegram DM

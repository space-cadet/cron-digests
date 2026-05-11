# Cron Digests

A running archive of automated daily digests — arXiv papers and web science news — delivered to Telegram and logged here.

## Digests

### arXiv Morning Digest
- **Schedule:** 7:11 AM IST, Monday–Friday
- **Categories:** hep-th, gr-qc, quant-ph, cond-mat
- **Focus:** Quantum gravity, loop quantum gravity, string theory, quantum computing, black hole thermodynamics, quantum cosmology, condensed matter, social physics
- **Archive:** [`arxiv/`](arxiv/)

### Web Science Digest
- **Schedule:** 10:17 AM IST, Monday–Friday
- **Rotation:**
  - Monday: arXiv.org + Nature News
  - Tuesday: Phys.org + ScienceDaily
  - Wednesday: Quanta Magazine + MIT News
  - Thursday: APS News + Physics World
  - Friday: Scientific American + Nautilus
- **Archive:** [`web-science/`](web-science/)

## Format

Each digest is saved as `YYYY-MM-DD.md` in its respective folder. Files follow a standard template with ranked items, URLs, and relevance notes.

## Automation

Powered by [OpenClaw](https://openclaw.ai) cron jobs. The agent generates the digest, writes the file, commits, and pushes — all hands-off.

## Viewer

Browse digests in a web interface: **[Live Viewer](https://space-cadet.github.io/cron-digests/viewer/)**

- Chronological card grid (latest first)
- Search across titles and content
- Filter by category (arXiv / Web Science)
- Click any card to read the full digest in a modal
- Works on mobile

---

*Last updated: 2026-05-11*

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

Each digest is saved as `YYYY-MM-DD.md` in its respective folder. Files follow a standard template with ranked items, URLs, relevance notes, and **subject tags**.

### Entry Template

```markdown
## N. [Paper/Article Title]
- **Authors:** ...
- **arXiv ID:** ... (arxiv only)
- **URL:** ...
- **Categories:** ... (arxiv only)
- **Tags:** Tag1, Tag2, Tag3
- **Relevance:** 🔥 High — ...
```

### Available Tags

Tags are assigned at generation time by the digest curator. Common tags include:

| Tag | Typical Content |
|-----|----------------|
| Quantum Gravity | Loop quantum gravity, string theory, CDT, emergent spacetime |
| Black Hole Physics | Thermodynamics, information paradox, evaporation, holography |
| Quantum Information & Computing | Qubits, error correction, algorithms, quantum supremacy |
| Cosmology & Early Universe | Inflation, CMB, dark energy, quantum cosmology |
| Field Theory & Mathematical Physics | QFT, CFT, topological field theory, math methods |
| Many-Body Physics & Condensed Matter | Strongly correlated systems, superconductivity, topological phases |
| Phase Transitions & Critical Phenomena | Critical exponents, universality, RG flows |
| Gravitational Waves & Astrophysics | LIGO, pulsar timing, multimessenger astronomy |
| High-Energy Physics & Phenomenology | Beyond Standard Model, SUSY, collider physics |
| Foundations & Interpretations | Measurement problem, interpretations, quantum foundations |

New tags are added when needed and tracked in [`tags.json`](tags.json).

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

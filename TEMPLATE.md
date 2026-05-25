# Digest Format Specification v2.0

## Header Block (required)

```markdown
# {Topic} Digest — YYYY-MM-DD
**Categories:** cat1, cat2, cat3  # for arXiv
**Sites:** Site1 + Site2          # for web science
**Items found:** N
**Focus:** brief topic summary
```

## Entry Format (required)

```markdown
## N. Entry Title
- **Source:** Source Name
- **URL:** https://...
- **Summary:** Brief description
- **Relevance:** Why this matters
- **Tags:** Tag1, Tag2, Tag3
```

## Rules

1. **Always use `## N.` for entries** — never `### N.`
2. **Always include `**Items found:** N`** — bold format
3. **Always include `**Categories:**` or `**Sites:**`** — bold format
4. **Always include `**Focus:**`** — brief comma-separated topics
5. **Always include `**Tags:**`** per entry — 2-3 tags from registry
6. **Never use section headers (`## Section Name`)** between entries
7. **Date format:** `YYYY-MM-DD` only — no "Monday, 11 May 2026"
8. **Separator:** `---` between entries (optional but consistent)

## Example (arXiv)

```markdown
# arXiv Digest — 2026-05-12
**Categories:** hep-th, gr-qc, quant-ph
**Items found:** 9
**Focus:** quantum gravity, black hole physics, quantum computing

## 1. Paper Title
- **Authors:** A. Author, B. Author
- **arXiv ID:** 2605.XXXXX
- **URL:** https://arxivite.org/abs/2605.XXXXX
- **Categories:** hep-th
- **Summary:** ...
- **Relevance:** ...
- **Tags:** Quantum Gravity, Black Hole Physics
```

## Example (Web Science)

```markdown
# Web Science Digest — 2026-05-12
**Sites:** Phys.org + ScienceDaily
**Items found:** 8
**Focus:** superconductivity, quantum devices, space propulsion

## 1. Article Title
- **Source:** Phys.org / Lab Name
- **URL:** https://phys.org/news/...
- **Summary:** ...
- **Relevance:** ...
- **Tags:** Many-Body Physics, Experiment & Observation
```

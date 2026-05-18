---
kind: edit_chunk
id: t7-viewer-overhaul
created_at: 2026-05-18 08:59:00 IST
task_ids: [T7]
source_branch: main
source_commit: 4bb3a5a
---

#### 08:59:00 IST - T7: Viewer UI/UX overhaul
- Modified `viewer/index.html` - Complete rewrite: CSS variable architecture for light/dark themes, instant index.json loading, tag filter bar, card tag chips, New badge, PDF links, keyboard navigation
- Modified `viewer/index.html` - Dark mode toggle with localStorage persistence and system preference detection
- Modified `viewer/index.html` - Tag filter bar with top-20 tags, count badges, active filter state sync
- Modified `viewer/index.html` - Per-card tag chips (up to 6), clickable to activate filter
- Modified `viewer/index.html` - New badge on latest digest card
- Modified `viewer/index.html` - Paper action buttons: Abstract and PDF links in modal
- Modified `viewer/index.html` - Keyboard navigation: j/k arrows, Enter to open, / to focus search, Esc to close/blur
- Modified `viewer/index.html` - Mouse hover syncs keyboard focus index
- Modified `viewer/index.html` - Compact tag chip sizing (smaller padding, font, border-radius)
- Modified `viewer/index.html` - arxivite.org replaces arxiv.org for all paper abstract and PDF links

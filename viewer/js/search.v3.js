/* ============================================
   Cron Digest Viewer — Search & List View
   ============================================ */

import { showModal, closeModal } from './modal.v3.js';

let allDigests = [];
let currentFilter = 'all';
let activeTag = null;
let onSourceFilterChange = null;
let focusedCardIndex = -1;
let visibleCards = [];

/**
 * Initialize search and list view
 */
export function initSearch(digests, sourceFilterCallback = null) {
  allDigests = digests;
  onSourceFilterChange = sourceFilterCallback;
  setupSearchListeners();
  setupFilterButtons();
}

/**
 * Render digests as cards (list view) with month-grouped sticky headers
 */
export function renderListView(digests) {
  const container = document.getElementById('listContainer');
  if (!container) return;

  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  const latestDate = allDigests.length > 0 ? allDigests[0].date : null;

  const filtered = filterDigests(digests, searchTerm);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">No digests found. Try adjusting your search, filter, or tag.</div>';
    visibleCards = [];
    focusedCardIndex = -1;
    return;
  }

  // Group by month
  const grouped = groupByMonth(filtered);

  let html = '';
  for (const [monthKey, monthDigests] of grouped) {
    html += `<div class="month-section">`;
    html += `<div class="month-header">${monthKey}</div>`;
    html += `<div class="digest-grid">`;
    html += monthDigests.map((d, idx) => buildCardHtml(d, idx, latestDate)).join('');
    html += `</div></div>`;
  }

  container.innerHTML = html;

  visibleCards = Array.from(container.querySelectorAll('.digest-card'));
  focusedCardIndex = visibleCards.length > 0 ? 0 : -1;
  updateFocus();

  // Event handlers
  container.querySelectorAll('.digest-card').forEach(card => {
    card.addEventListener('click', () => {
      const date = card.dataset.date;
      const type = card.dataset.type;
      const digest = allDigests.find(d => d.date === date && d.type === type);
      if (digest) {
        pushHash(`digest=${date}-${type}`);
        showModal(digest);
      }
    });
  });

  // Math rendering
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }
}

/**
 * Group digests by month (e.g., "July 2026")
 */
function groupByMonth(digests) {
  const map = new Map();
  digests.forEach(d => {
    const [year, month] = d.date.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  });
  return map;
}

/**
 * Build card HTML
 */
function buildCardHtml(d, idx, latestDate) {
  const isNew = d.date === latestDate;
  const tags = d.allTags?.slice(0, 6) || [];
  return `
    <div class="digest-card" data-type="${d.type}" data-date="${d.date}" data-index="${idx}">
      <div class="card-header">
        <span class="digest-type type-${d.type === 'arxiv' ? 'arxiv' : d.type === 'moltbook' ? 'moltbook' : 'web'}">${d.type}</span>
        ${isNew ? '<span class="new-badge">New</span>' : ''}
      </div>
      <div class="digest-date">${d.date}</div>
      <div class="digest-meta">${d.meta?.categories || d.meta?.sites || ''}</div>
      <div class="digest-preview">
        ${d.meta?.items?.map(item => `<h3>• ${item}</h3>`).join('') || ''}
      </div>
      ${tags.length ? `<div class="card-tags">${tags.map(t => `<span class="card-tag" data-tag="${t}">${t}</span>`).join('')}</div>` : ''}
      <span class="item-count">${d.meta?.itemCount || '?'} items</span>
    </div>
  `;
}

/**
 * Filter digests by search, type, and tag
 */
function filterDigests(digests, searchTerm) {
  return digests.filter(d => {
    if (currentFilter !== 'all' && d.type !== currentFilter) return false;
    if (activeTag) {
      const hasTag = d.entries?.some(e => (e.tags || []).includes(activeTag))
        || d.allTags?.includes(activeTag);
      if (!hasTag) return false;
    }
    if (!searchTerm) return true;

    if (d.content && d.content.toLowerCase().includes(searchTerm)) return true;
    if (d.entries) {
      return d.entries.some(e =>
        (e.title && e.title.toLowerCase().includes(searchTerm)) ||
        (e.authors && e.authors.toLowerCase().includes(searchTerm)) ||
        (e.summary && e.summary.toLowerCase().includes(searchTerm)) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(searchTerm)))
      );
    }
    return d.date.includes(searchTerm) ||
      (d.meta?.items && d.meta.items.some(item => item.toLowerCase().includes(searchTerm)));
  });
}

/**
 * Update keyboard focus
 */
function updateFocus() {
  visibleCards.forEach((c, i) => {
    c.classList.toggle('focused', i === focusedCardIndex);
  });
}

/**
 * Setup search input listener
 */
function setupSearchListeners() {
  document.getElementById('searchInput')?.addEventListener('input', () => {
    renderListView(allDigests);
  });
}

/**
 * Setup filter buttons
 */
function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      onSourceFilterChange?.(currentFilter);
      renderListView(allDigests);
    });
  });
}

/**
 * Update digests reference
 */
export function updateSearchDigests(digests) {
  allDigests = digests;
  renderListView(digests);
}

/**
 * Get current filter
 */
export function getCurrentFilter() {
  return currentFilter;
}

/**
 * Keyboard navigation for list view
 */
export function handleListKeydown(e) {
  if (e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') {
      e.target.blur();
    }
    return;
  }

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (visibleCards.length === 0) return;
    focusedCardIndex = Math.min(focusedCardIndex + 1, visibleCards.length - 1);
    updateFocus();
    visibleCards[focusedCardIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (visibleCards.length === 0) return;
    focusedCardIndex = Math.max(focusedCardIndex - 1, 0);
    updateFocus();
    visibleCards[focusedCardIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (focusedCardIndex >= 0 && focusedCardIndex < visibleCards.length) {
      visibleCards[focusedCardIndex].click();
    }
  } else if (e.key === '/') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
}

/**
 * Push hash for history (helper)
 */
function pushHash(hash) {
  history.pushState(null, '', '#' + hash);
}

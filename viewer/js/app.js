/* ============================================
   Cron Digest Viewer — Main App
   ============================================ */

import { initCalendar, updateCalendarDigests } from './calendar.js';
import { showModal, closeModal } from './modal.js';
import { initSearch, renderListView, updateSearchDigests, handleListKeydown } from './search.js';

const SOURCES = {
  arxiv: './arxiv/',
  'web-science': './web-science/',
  moltbook: './moltbook/'
};

let allDigests = [];
let currentView = 'calendar'; // 'calendar' | 'list'
let activeTag = null;

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem('digest-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('digest-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ---------- Data Loading ---------- */
async function fetchDigests() {
  try {
    const response = await fetch('index.json');
    if (!response.ok) throw new Error('Failed to load index.json');

    const index = await response.json();
    allDigests = index.digests.map(d => ({
      type: d.type,
      date: d.date,
      path: `${SOURCES[d.type]}${d.date}.md`,
      content: null,
      meta: {
        itemCount: d.items_found,
        categories: d.type === 'arxiv' ? d.categories : null,
        sites: d.type === 'web-science' ? d.categories : null,
        items: d.entries.slice(0, 3).map(e => e.title)
      },
      entries: d.entries,
      allTags: [...new Set(d.entries.flatMap(e => e.tags || []))]
    }));

    console.log(`Loaded ${allDigests.length} digests from index.json`);
    initComponents();
  } catch (e) {
    console.error('Failed to load digests:', e);
    document.getElementById('calendarContainer').innerHTML =
      `<div class="error">Failed to load digests: ${e.message}</div>`;
  }
}

/* ---------- Components ---------- */
function initComponents() {
  // Sort by date descending
  allDigests.sort((a, b) => b.date.localeCompare(a.date));

  // Calendar
  initCalendar(allDigests, (date, digests) => {
    // Show modal with first digest, or a combined view
    if (digests.length === 1) {
      showModal(digests[0]);
    } else {
      // Show a combined modal for the day
      showDayModal(date, digests);
    }
  });

  // List view
  initSearch(allDigests);
  renderListView(allDigests);

  // Tag bar
  renderTagBar();

  // View toggle
  setupViewToggle();

  // Show default view
  showView('calendar');
}

/* ---------- View Toggle ---------- */
function setupViewToggle() {
  document.getElementById('viewCalendar')?.addEventListener('click', () => showView('calendar'));
  document.getElementById('viewList')?.addEventListener('click', () => showView('list'));
}

function showView(view) {
  currentView = view;
  document.getElementById('viewCalendar')?.classList.toggle('active', view === 'calendar');
  document.getElementById('viewList')?.classList.toggle('active', view === 'list');
  document.getElementById('calendarView')?.classList.toggle('active', view === 'calendar');
  document.getElementById('listView')?.classList.toggle('active', view === 'list');
}

/* ---------- Day Modal (for calendar) ---------- */
function showDayModal(date, digests) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');

  let html = `<div class="day-modal-header">`;
  html += `<h1>${date}</h1>`;
  html += `<span class="day-modal-subtitle">${digests.length} digest${digests.length > 1 ? 's' : ''}</span>`;
  html += `</div>`;
  html += `<div class="day-modal-digests">`;

  digests.forEach(d => {
    const typeClass = d.type === 'arxiv' ? 'arxiv' : d.type === 'moltbook' ? 'moltbook' : 'web';
    const typeLabel = d.type === 'arxiv' ? 'arXiv' : d.type === 'moltbook' ? 'Moltbook' : 'Web Science';
    const itemCount = d.meta?.itemCount ?? '?';
    const items = d.meta?.items || [];

    html += `<div class="day-digest-card ${typeClass}" data-date="${d.date}" data-type="${d.type}">`;
    html += `<div class="day-digest-header">`;
    html += `<span class="day-digest-type type-${typeClass}">${typeLabel}</span>`;
    html += `<span class="day-digest-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>`;
    html += `</div>`;
    html += `<div class="day-digest-items">`;
    if (items.length > 0) {
      items.forEach(item => {
        html += `<div class="day-digest-item">${item}</div>`;
      });
    } else {
      html += `<div class="day-digest-item empty">No preview available</div>`;
    }
    html += `</div>`;
    html += `<div class="day-digest-footer">Click to read full digest →</div>`;
    html += `</div>`;
  });

  html += `</div>`;

  body.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Click handlers for each digest card
  body.querySelectorAll('.day-digest-card').forEach(card => {
    card.addEventListener('click', () => {
      const date = card.dataset.date;
      const type = card.dataset.type;
      const digest = allDigests.find(d => d.date === date && d.type === type);
      if (digest) {
        import('./modal.js').then(m => m.showModal(digest));
      }
    });
  });
}

// Expose for onclick handlers
window.loadDigestModal = function(date, type) {
  const digest = allDigests.find(d => d.date === date && d.type === type);
  if (digest) showModal(digest);
};

/* ---------- Tag Bar ---------- */
function renderTagBar() {
  const bar = document.getElementById('tagBar');
  if (!bar) return;

  const tagCounts = {};
  allDigests.forEach(d => {
    (d.allTags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
  });

  const tags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (tags.length === 0) {
    bar.innerHTML = '';
    return;
  }

  bar.innerHTML = '<span class="tag-bar-label">Filter by tag:</span> ' +
    tags.map(([tag, count]) => `
      <span class="tag-chip ${activeTag === tag ? 'active' : ''}" data-tag="${tag}">
        ${tag} <span class="count">${count}</span>
      </span>
    `).join('') +
    (activeTag ? '<span class="tag-clear" id="tagClear">Clear filter</span>' : '');

  bar.querySelectorAll('.tag-chip').forEach(el => {
    el.addEventListener('click', () => {
      const tag = el.dataset.tag;
      activeTag = activeTag === tag ? null : tag;
      renderTagBar();
      applyFilter();
    });
  });

  document.getElementById('tagClear')?.addEventListener('click', () => {
    activeTag = null;
    renderTagBar();
    applyFilter();
  });
}

function applyFilter() {
  let filtered = allDigests;
  if (activeTag) {
    filtered = allDigests.filter(d =>
      d.entries?.some(e => (e.tags || []).includes(activeTag)) ||
      d.allTags?.includes(activeTag)
    );
  }

  updateCalendarDigests(filtered);
  updateSearchDigests(filtered);
}

/* ---------- Keyboard Events ---------- */
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modal');
  if (modal?.classList.contains('active')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    }
    return;
  }

  if (currentView === 'list') {
    handleListKeydown(e);
  }
});

/* ---------- Modal Events ---------- */
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

/* ---------- Theme Toggle ---------- */
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

/* ---------- Init ---------- */
initTheme();
fetchDigests();

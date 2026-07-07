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

  let html = `<h1>${date}</h1>`;
  html += `<p>${digests.length} digest(s) for this day:</p><hr>`;

  digests.forEach(d => {
    html += `<div class="paper-item">`;
    html += `<h2><span class="digest-type type-${d.type === 'arxiv' ? 'arxiv' : d.type === 'moltbook' ? 'moltbook' : 'web'}">${d.type}</span> — ${d.meta?.itemCount || '?'} items</h2>`;
    html += `<p>${d.meta?.items?.join(', ') || 'No preview available'}</p>`;
    html += `<button class="icon-btn" style="margin-top:10px" onclick="window.loadDigestModal('${d.date}', '${d.type}')">📖 Read</button>`;
    html += `</div>`;
  });

  body.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
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

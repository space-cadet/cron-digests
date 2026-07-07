/* ============================================
   Cron Digest Viewer — Calendar Component
   ============================================ */

import { getMonthName, getDaysInMonth, getFirstDayOfMonth, isToday, groupDigestsByDate } from './utils.js';

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let digestMap = {};
let onDayClick = null;

/**
 * Initialize calendar with digest data
 */
export function initCalendar(digests, onDayClickHandler) {
  digestMap = groupDigestsByDate(digests);
  onDayClick = onDayClickHandler;
  renderCalendar(currentYear, currentMonth);
  setupNavigation();
}

/**
 * Render the calendar grid for a given month
 */
function renderCalendar(year, month) {
  const container = document.getElementById('calendarContainer');
  if (!container) return;

  const monthName = getMonthName(year, month);
  document.getElementById('calendarMonth').textContent = monthName;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  let html = '';

  // Day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(name => {
    html += `<div class="calendar-day-header">${name}</div>`;
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDigests = digestMap[dateStr] || [];
    const hasContent = dayDigests.length > 0;
    const todayClass = isToday(dateStr) ? 'today' : '';

    let dotsHtml = '';
    let totalItems = 0;

    if (hasContent) {
      const types = new Set(dayDigests.map(d => d.type));
      dotsHtml = '<div class="day-dots">';
      types.forEach(type => {
        dotsHtml += `<span class="dot ${type}"></span>`;
      });
      dotsHtml += '</div>';
      totalItems = dayDigests.reduce((sum, d) => sum + (d.meta?.itemCount || 0), 0);
    }

    const itemCountHtml = totalItems > 0 ? `<span class="item-count">${totalItems}</span>` : '';

    html += `
      <div class="calendar-day ${todayClass}" data-date="${dateStr}">
        <span class="day-number">${day}</span>
        ${dotsHtml}
        ${itemCountHtml}
      </div>
    `;
  }

  container.innerHTML = html;

  // Click handlers
  container.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
    dayEl.addEventListener('click', () => {
      const date = dayEl.dataset.date;
      const digests = digestMap[date] || [];
      if (onDayClick && digests.length > 0) {
        onDayClick(date, digests);
      }
    });
  });
}

/**
 * Setup prev/next month navigation
 */
function setupNavigation() {
  document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
}

/**
 * Update digest map (e.g. after filter change)
 */
export function updateCalendarDigests(digests) {
  digestMap = groupDigestsByDate(digests);
  renderCalendar(currentYear, currentMonth);
}

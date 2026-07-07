/* ============================================
   Cron Digest Viewer — Utilities
   ============================================ */

/**
 * Convert markdown text to HTML
 */
function convertMarkdownToHtml(text) {
  return text
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/---/g, '<hr>')
    .replace(/\n\n+/g, '<br><br>')
    .replace(/\n/g, ' ');
}

/**
 * Parse digest metadata from markdown content
 */
function parseDigestMeta(content, type) {
  const meta = { items: [] };
  const itemsMatch = content.match(/\*\*Items found:\*\*\s*(\d+)/);
  if (itemsMatch) meta.itemCount = parseInt(itemsMatch[1]);

  if (type === 'arxiv') {
    const catMatch = content.match(/\*\*Categories:\*\*\s*([^\n]+)/);
    if (catMatch) meta.categories = catMatch[1].trim();
  } else if (type === 'moltbook') {
    const submoltsMatch = content.match(/\*\*Submolts:\*\*\s*([^\n]+)/);
    if (submoltsMatch) meta.categories = submoltsMatch[1].trim();
  } else {
    const sitesMatch = content.match(/\*\*Sites:\*\*\s*([^\n]+)/);
    if (sitesMatch) meta.sites = sitesMatch[1].trim();
  }

  const titles = content.match(/^## \d+\.\s*(.+)/gm);
  if (titles) meta.items = titles.slice(0, 3).map(t => t.replace(/^## \d+\.\s*/, ''));
  return meta;
}

/**
 * Extract arXiv ID from text
 */
function extractArxivId(text) {
  const m = text.match(/\*\*arXiv ID:\*\*\s*(\d{4}\.\d{4,5})/);
  return m ? m[1] : null;
}

/**
 * Extract category chips HTML from text
 */
function extractCategoryChips(text) {
  const catMatch = text.match(/\*\*Categories:\*\*[ \t]*([^\n]*)/);
  if (!catMatch) return '';
  const cats = catMatch[1].split(',').map(c => c.trim().split(' ')[0]).filter(c => c);
  if (cats.length === 0) return '';
  return `<div class="paper-chips">` +
    cats.map(cat => `<span class="chip ${cat}">${cat}</span>`).join('') +
    `</div>`;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get month name
 */
function getMonthName(year, month) {
  return new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
}

/**
 * Get days in month
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday)
 */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Check if a date is today
 */
function isToday(dateStr) {
  return dateStr === formatDate(new Date());
}

/**
 * Group digests by date
 */
function groupDigestsByDate(digests) {
  const map = {};
  digests.forEach(d => {
    if (!map[d.date]) map[d.date] = [];
    map[d.date].push(d);
  });
  return map;
}

export {
  convertMarkdownToHtml,
  parseDigestMeta,
  extractArxivId,
  extractCategoryChips,
  formatDate,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  groupDigestsByDate
};

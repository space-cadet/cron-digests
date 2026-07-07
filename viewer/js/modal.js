/* ============================================
   Cron Digest Viewer — Modal Component
   ============================================ */

import { convertMarkdownToHtml, extractArxivId, extractCategoryChips } from './utils.js';

let currentDigest = null;

/**
 * Show modal with digest content
 */
export async function showModal(digest) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');

  // Load content if not cached
  if (!digest.content) {
    try {
      const response = await fetch(digest.path);
      if (response.ok) {
        digest.content = await response.text();
      } else {
        digest.content = `Error loading digest: ${response.status}`;
      }
    } catch (e) {
      digest.content = `Error loading digest: ${e.message}`;
    }
  }

  const html = buildModalHtml(digest);
  body.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Render LaTeX math
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(body, {
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
 * Close modal
 */
export function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Build modal HTML based on digest type
 */
function buildModalHtml(digest) {
  const { content, type, date, entries } = digest;
  const isArxiv = type === 'arxiv';

  // Build table of contents
  const entryMatches = [...content.matchAll(/^## (\d+)\.\s*(.+)$/gm)];
  const tocItems = entryMatches.map(m => ({ num: m[1], title: m[2] }));

  let tocHtml = '';
  if (tocItems.length > 0) {
    tocHtml = `<div class="modal-toc"><h3>📋 Contents</h3><ul>` +
      tocItems.map(item => `<li onclick="window.scrollToItem('${item.num}')">${item.num}. ${item.title}</li>`).join('') +
      `</ul></div>`;
  }

  let html = `<h1>${date} — ${type}</h1>`;
  html += tocHtml;

  if (isArxiv) {
    html += buildArxivHtml(content, entryMatches, entries);
  } else if (type === 'moltbook') {
    html += buildMoltbookHtml(content);
  } else {
    html += buildWebScienceHtml(content);
  }

  return html;
}

/**
 * Build arXiv-specific HTML
 */
function buildArxivHtml(content, entryMatches, entries) {
  let html = '';

  const headerMatch = content.match(/^(.*?)(?=## \d+\.)/s);
  if (headerMatch) {
    html += convertMarkdownToHtml(headerMatch[1].trim());
  }

  entryMatches.forEach((match) => {
    const num = match[1];
    const title = match[2];
    const sectionStart = content.indexOf(match[0]);
    const nextSection = content.indexOf('## ' + (parseInt(num) + 1) + '.', sectionStart + 1);
    const sectionContent = nextSection > 0
      ? content.slice(sectionStart + match[0].length, nextSection)
      : content.slice(sectionStart + match[0].length);

    const chips = extractCategoryChips(sectionContent);
    const arxivId = extractArxivId(sectionContent);

    html += `<div class="paper-item" id="paper-${num}">`;
    html += `<h2>${num}. ${title}</h2>`;
    if (chips) html += chips;

    if (arxivId) {
      html += `<div class="paper-actions">` +
        `<a href="https://arxivite.org/abs/${arxivId}" target="_blank" class="btn-abs">📄 Abstract</a>` +
        `<a href="https://arxivite.org/pdf/${arxivId}" target="_blank" class="btn-pdf">📥 PDF</a>` +
        `</div>`;
    }

    html += convertMarkdownToHtml(sectionContent);
    html += `</div>`;
  });

  return html;
}

/**
 * Build Moltbook-specific HTML
 */
function buildMoltbookHtml(content) {
  const lines = content.split('\n');
  let buffer = [];
  let entriesList = [];
  let headerLines = [];
  let inHeader = true;

  for (let line of lines) {
    if (line.match(/^## \d+\./)) {
      if (buffer.length > 0) {
        entriesList.push({ content: buffer.join('\n') });
        buffer = [];
      }
      buffer.push(line);
      inHeader = false;
    } else if (inHeader && !line.match(/^## \d+\./)) {
      headerLines.push(line);
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) {
    entriesList.push({ content: buffer.join('\n') });
  }

  let html = '';
  if (headerLines.length > 0) {
    html += convertMarkdownToHtml(headerLines.join('\n').trim());
  }

  entriesList.forEach((entry) => {
    const match = entry.content.match(/^## (\d+)\.\s*(.+)$/m);
    if (match) {
      const num = match[1];
      const title = match[2];
      const entryContent = entry.content.slice(match[0].length);
      const submoltMatch = entryContent.match(/\*\*Submolt:\*\*\s*(.+)/);
      const authorMatch = entryContent.match(/\*\*Author:\*\*\s*(.+)/);
      const urlMatch = entryContent.match(/\*\*URL:\*\*\s*(\S+)/);

      let chips = '';
      if (submoltMatch) {
        const submolt = submoltMatch[1].trim();
        chips = `<div class="paper-chips"><span class="chip">${submolt}</span></div>`;
      }

      html += `<div class="paper-item" id="paper-${num}">`;
      html += `<h2>${num}. ${title}</h2>`;
      if (chips) html += chips;
      if (authorMatch) {
        html += `<p><strong>Author:</strong> ${authorMatch[1].trim()}</p>`;
      }
      if (urlMatch) {
        html += `<div class="paper-actions"><a href="${urlMatch[1].trim()}" target="_blank" class="btn-abs">🔗 Open on Moltbook</a></div>`;
      }
      html += convertMarkdownToHtml(entryContent);
      html += `</div>`;
    }
  });

  return html;
}

/**
 * Build Web Science HTML
 */
function buildWebScienceHtml(content) {
  const lines = content.split('\n');
  let buffer = [];
  let entriesList = [];
  let headerLines = [];
  let inHeader = true;

  for (let line of lines) {
    if (line.match(/^## \d+\./)) {
      if (buffer.length > 0) {
        entriesList.push({ content: buffer.join('\n') });
        buffer = [];
      }
      buffer.push(line);
      inHeader = false;
    } else if (inHeader && !line.match(/^## \d+\./)) {
      headerLines.push(line);
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) {
    entriesList.push({ content: buffer.join('\n') });
  }

  let html = '';
  if (headerLines.length > 0) {
    html += convertMarkdownToHtml(headerLines.join('\n').trim());
  }

  entriesList.forEach((entry) => {
    const match = entry.content.match(/^## (\d+)\.\s*(.+)$/m);
    if (match) {
      const num = match[1];
      const title = match[2];
      const entryContent = entry.content.slice(match[0].length);
      const sourceMatch = entryContent.match(/\*\*Source:\*\*\s*(.+)/);

      let chips = '';
      if (sourceMatch) {
        const source = sourceMatch[1].trim();
        chips = `<div class="paper-chips"><span class="chip">${source}</span></div>`;
      }

      html += `<div class="paper-item" id="paper-${num}">`;
      html += `<h2>${num}. ${title}</h2>`;
      if (chips) html += chips;
      html += convertMarkdownToHtml(entryContent);
      html += `</div>`;
    }
  });

  return html;
}

// Expose scroll helper globally for TOC clicks
window.scrollToItem = function(num) {
  const el = document.getElementById(`paper-${num}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

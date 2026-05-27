const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Build SQLite index and JSON export for cron-digests viewer.
 * Usage: node scripts/build-index.js
 */

const DB_PATH = path.join(__dirname, '..', 'viewer', 'index.db');
const JSON_PATH = path.join(__dirname, '..', 'viewer', 'index.json');
const ROOT = path.join(__dirname, '..');

function parseDigest(content, digestType) {
  const lines = content.split('\n');
  const header = { type: digestType };
  const entries = [];
  let currentEntry = null;
  let lineNum = 0;

  for (const rawLine of lines) {
    lineNum++;
    const line = rawLine.trimEnd();

    if (lineNum === 1) {
      const m = line.match(/^# (.+) Digest — (\d{4}-\d{2}-\d{2})$/);
      if (m) {
        header.title = line;
        header.date = m[2];
      }
      continue;
    }

    if (!line && lineNum < 10) continue;

    const catMatch = line.match(/^\*\*Categories:\*\*\s*(.+)/);
    if (catMatch) header.categories = catMatch[1].trim();

    const sitesMatch = line.match(/^\*\*Sites:\*\*\s*(.+)/);
    if (sitesMatch) header.sites = sitesMatch[1].trim();

    const itemsMatch = line.match(/^\*\*Items found:\*\*\s*(\d+)/);
    if (itemsMatch) header.items_found = parseInt(itemsMatch[1], 10);

    const focusMatch = line.match(/^\*\*Focus:\*\*\s*(.+)/);
    if (focusMatch) header.focus = focusMatch[1].trim();

    const entryStart = line.match(/^##\s+(\d+)\.\s*(.+)$/);
    if (entryStart) {
      if (currentEntry) entries.push(finalizeEntry(currentEntry));
      currentEntry = {
        number: parseInt(entryStart[1], 10),
        title: entryStart[2].trim(),
        lines: []
      };
      continue;
    }

    if (currentEntry && line) {
      currentEntry.lines.push(line);
    }
  }

  if (currentEntry) entries.push(finalizeEntry(currentEntry));

  for (const e of entries) {
    const body = e.lines.join('\n');
    delete e.lines;

    // ArXiv-style fields
    const authors = body.match(/^- \*\*Authors:\*\*\s*(.+)/m);
    if (authors) e.authors = authors[1].trim();

    const source = body.match(/^- \*\*Source:\*\*\s*(.+)/m);
    if (source) e.source = source[1].trim();

    const arxivId = body.match(/^- \*\*arXiv ID:\*\*\s*(\d{4}\.\d{4,5})/m);
    if (arxivId) e.arxiv_id = arxivId[1].trim();

    const url = body.match(/^- \*\*URL:\*\*\s*(\S+)/m);
    if (url) e.url = url[1].trim();

    // ArXiv-style categories
    const cats = body.match(/^- \*\*Categories:\*\*\s*(.+)/m);
    if (cats) e.categories = cats[1].trim();

    // ArXiv-style summary
    const summary = body.match(/^- \*\*Summary:\*\*\s*(.+)/m);
    if (summary) e.summary = summary[1].trim();

    // ArXiv-style relevance
    const relevance = body.match(/^- \*\*Relevance:\*\*\s*(.+)/m);
    if (relevance) e.relevance = relevance[1].trim();
    else {
      const rm = body.match(/^- \*\*Relevance:\*\*\s*([\s\S]*?)(?=^- \*\*Tags:|$)/m);
      if (rm) e.relevance = rm[1].trim();
    }

    // Moltbook-style key idea (maps to summary)
    const keyIdea = body.match(/^- \*\*Key idea:\*\*\s*(.+)/m) || body.match(/^- \*\*Key Idea:\*\*\s*(.+)/m);
    if (keyIdea && !e.summary) e.summary = keyIdea[1].trim();

    // Moltbook-style why it matters (maps to relevance)
    const whyMatters = body.match(/^- \*\*Why it matters:\*\*\s*(.+)/m);
    if (whyMatters && !e.relevance) e.relevance = whyMatters[1].trim();

    // Tags
    const tags = body.match(/^- \*\*Tags:\*\*\s*(.+)/m);
    if (tags) {
      e.tags = tags[1].split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return { header, entries };
}

function finalizeEntry(entry) {
  return entry;
}

function buildSQLite(digests) {
  // Remove old DB
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const sql = [
    `CREATE TABLE digests (`
      + `date TEXT,`
      + `type TEXT,`
      + `categories TEXT,`
      + `sites TEXT,`
      + `items_found INTEGER,`
      + `focus TEXT,`
      + `title TEXT,`
      + `PRIMARY KEY (date, type)`
    + `);`,
    `CREATE TABLE entries (`
      + `id INTEGER PRIMARY KEY AUTOINCREMENT,`
      + `digest_date TEXT,`
      + `entry_num INTEGER,`
      + `title TEXT,`
      + `authors TEXT,`
      + `source TEXT,`
      + `arxiv_id TEXT,`
      + `url TEXT,`
      + `categories TEXT,`
      + `summary TEXT,`
      + `relevance TEXT`
    + `);`,
    `CREATE TABLE tags (`
      + `id INTEGER PRIMARY KEY AUTOINCREMENT,`
      + `digest_date TEXT,`
      + `entry_num INTEGER,`
      + `tag TEXT`
    + `);`,
    `CREATE INDEX idx_entries_date ON entries(digest_date);`,
    `CREATE INDEX idx_tags_tag ON tags(tag);`,
    `CREATE INDEX idx_tags_date ON tags(digest_date);`
  ];

  // Write schema
  if (fs.existsSync('/tmp/index_data.sql')) fs.unlinkSync('/tmp/index_data.sql');
  fs.writeFileSync('/tmp/index_schema.sql', sql.join('\n'));
  execSync(`sqlite3 "${DB_PATH}" < /tmp/index_schema.sql`);

  // Insert data
  for (const d of digests) {
    const { header, entries } = d.parsed;
    const date = header.date;
    const type = header.type;
    const categories = header.categories || header.sites || '';
    const sites = header.sites || '';
    const items = header.items_found || entries.length;
    const focus = header.focus || '';
    const title = header.title || '';

    const insertDigest = `INSERT INTO digests VALUES ('${date.replace(/'/g, "''")}', '${type}', '${categories.replace(/'/g, "''")}', '${sites.replace(/'/g, "''")}', ${items}, '${focus.replace(/'/g, "''")}', '${title.replace(/'/g, "''")}');`;
    fs.appendFileSync('/tmp/index_data.sql', insertDigest + '\n');

    for (const e of entries) {
      const insertEntry = `INSERT INTO entries (digest_date, entry_num, title, authors, source, arxiv_id, url, categories, summary, relevance) VALUES ('${date.replace(/'/g, "''")}', ${e.number}, '${e.title.replace(/'/g, "''")}', '${(e.authors || '').replace(/'/g, "''")}', '${(e.source || '').replace(/'/g, "''")}', '${(e.arxiv_id || '').replace(/'/g, "''")}', '${(e.url || '').replace(/'/g, "''")}', '${(e.categories || '').replace(/'/g, "''")}', '${(e.summary || '').replace(/'/g, "''")}', '${(e.relevance || '').replace(/'/g, "''")}');`;
      fs.appendFileSync('/tmp/index_data.sql', insertEntry + '\n');

      for (const tag of (e.tags || [])) {
        const insertTag = `INSERT INTO tags (digest_date, entry_num, tag) VALUES ('${date.replace(/'/g, "''")}', ${e.number}, '${tag.replace(/'/g, "''")}');`;
        fs.appendFileSync('/tmp/index_data.sql', insertTag + '\n');
      }
    }
  }

  execSync(`sqlite3 "${DB_PATH}" < /tmp/index_data.sql`);
  execSync(`rm -f /tmp/index_schema.sql /tmp/index_data.sql`);

  console.log(`SQLite index: ${DB_PATH} (${digests.length} digests)`);
}

function buildJSON(digests) {
  const index = {
    generated: new Date().toISOString(),
    digests: [],
    stats: {
      total_digests: digests.length,
      total_entries: 0,
      unique_tags: {},
      tag_counts: {},
      dates_by_type: {}
    }
  };

  for (const d of digests) {
    const { header, entries } = d.parsed;
    const digest = {
      date: header.date,
      type: header.type,
      title: header.title,
      categories: header.categories || header.sites,
      items_found: header.items_found || entries.length,
      focus: header.focus,
      entries: entries.map(e => ({
        num: e.number,
        title: e.title,
        authors: e.authors,
        source: e.source,
        arxiv_id: e.arxiv_id,
        url: e.url,
        categories: e.categories,
        summary: e.summary,
        relevance: e.relevance,
        tags: e.tags || []
      }))
    };

    index.digests.push(digest);
    index.stats.total_entries += entries.length;

    for (const e of entries) {
      for (const tag of (e.tags || [])) {
        index.stats.tag_counts[tag] = (index.stats.tag_counts[tag] || 0) + 1;
        if (!index.stats.unique_tags[tag]) {
          index.stats.unique_tags[tag] = { first_seen: header.date, count: 0 };
        }
        index.stats.unique_tags[tag].count++;
      }
    }

    index.stats.dates_by_type[header.type] = index.stats.dates_by_type[header.type] || [];
    index.stats.dates_by_type[header.type].push(header.date);
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(index, null, 2));
  console.log(`JSON index: ${JSON_PATH} (${index.stats.total_entries} entries, ${Object.keys(index.stats.unique_tags).length} unique tags)`);
}

function main() {
  const digests = [];
  const types = ['arxiv', 'web-science', 'moltbook'];

  for (const t of types) {
    const dir = path.join(ROOT, t);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md') && f !== 'README.md') {
        const filePath = path.join(dir, f);
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = parseDigest(content, t);
        digests.push({ file: f, type: t, parsed });
      }
    }
  }

  // Sort by date descending
  digests.sort((a, b) => b.parsed.header.date.localeCompare(a.parsed.header.date));

  buildSQLite(digests);
  buildJSON(digests);
}

main();

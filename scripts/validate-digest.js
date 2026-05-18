const fs = require('fs');
const path = require('path');

/**
 * Parse a digest markdown file into structured data.
 * Returns { header, entries, raw, errors }.
 */
function parseDigest(content, digestType) {
  const lines = content.split('\n');
  const errors = [];
  let header = { type: digestType };
  let entries = [];
  let currentEntry = null;
  let lineNum = 0;

  for (const rawLine of lines) {
    lineNum++;
    const line = rawLine.trimEnd();

    // Title line
    if (lineNum === 1) {
      const m = line.match(/^# (.+) Digest — (\d{4}-\d{2}-\d{2})$/);
      if (!m) {
        errors.push(`Line ${lineNum}: Invalid title. Expected "# {Type} Digest — YYYY-MM-DD"`);
        continue;
      }
      header.title = line;
      header.date = m[2];
      continue;
    }

    // Skip blank lines early in header
    if (!line && lineNum < 10) continue;

    // Header fields
    const catMatch = line.match(/^\*\*Categories:\*\*\s*(.+)/);
    if (catMatch) header.categories = catMatch[1].trim();

    const sitesMatch = line.match(/^\*\*Sites:\*\*\s*(.+)/);
    if (sitesMatch) header.sites = sitesMatch[1].trim();

    const itemsMatch = line.match(/^\*\*Items found:\*\*\s*(\d+)/);
    if (itemsMatch) header.items_found = parseInt(itemsMatch[1], 10);

    const focusMatch = line.match(/^\*\*Focus:\*\*\s*(.+)/);
    if (focusMatch) header.focus = focusMatch[1].trim();

    // Entry start: ## N. Title
    const entryStart = line.match(/^##\s+(\d+)\.\s*(.+)$/);
    if (entryStart) {
      if (currentEntry) {
        pushEntry(entries, currentEntry, errors, lineNum);
      }
      currentEntry = {
        number: parseInt(entryStart[1], 10),
        title: entryStart[2].trim(),
        lines: []
      };
      continue;
    }

    // Prohibited: unnumbered section headers between entries
    const badSection = line.match(/^##\s+[^0-9#]/);
    if (badSection && currentEntry) {
      errors.push(`Line ${lineNum}: Unnumbered section header "${line}" inside entry. Remove or convert to ###.`);
    }

    // Entry body lines
    if (currentEntry && line) {
      currentEntry.lines.push(line);
    }
  }

  if (currentEntry) {
    pushEntry(entries, currentEntry, errors, lineNum);
  }

  // Normalize entries
  for (const e of entries) {
    const body = e.lines.join('\n');

    const authors = body.match(/^- \*\*Authors:\*\*\s*(.+)/m);
    if (authors) e.authors = authors[1].trim();

    const source = body.match(/^- \*\*Source:\*\*\s*(.+)/m);
    if (source) e.source = source[1].trim();

    const arxivId = body.match(/^- \*\*arXiv ID:\*\*\s*(\d{4}\.\d{4,5})/m);
    if (arxivId) e.arxiv_id = arxivId[1].trim();

    const url = body.match(/^- \*\*URL:\*\*\s*(\S+)/m);
    if (url) e.url = url[1].trim();

    const cats = body.match(/^- \*\*Categories:\*\*\s*(.+)/m);
    if (cats) e.categories = cats[1].trim();

    const summary = body.match(/^- \*\*Summary:\*\*\s*(.+)/m);
    if (summary) e.summary = summary[1].trim();
    else {
      // Multi-line summary
      const sm = body.match(/^- \*\*Summary:\*\*\s*([\s\S]*?)(?=^- \*\*Relevance:|^- \*\*Tags:|$)/m);
      if (sm) e.summary = sm[1].trim();
    }

    const relevance = body.match(/^- \*\*Relevance:\*\*\s*(.+)/m);
    if (relevance) e.relevance = relevance[1].trim();
    else {
      const rm = body.match(/^- \*\*Relevance:\*\*\s*([\s\S]*?)(?=^- \*\*Tags:|$)/m);
      if (rm) e.relevance = rm[1].trim();
    }

    const tags = body.match(/^- \*\*Tags:\*\*\s*(.+)/m);
    if (tags) {
      e.tags = tags[1].split(',').map(t => t.trim()).filter(Boolean);
    }

    delete e.lines;
  }

  // Validate items_found count
  if (header.items_found != null && header.items_found !== entries.length) {
    errors.push(`Header says ${header.items_found} items but found ${entries.length} entries.`);
  }

  // Validate sequential numbering
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].number !== i + 1) {
      errors.push(`Entry ${i + 1} has number ${entries[i].number} — expected ${i + 1}.`);
    }
  }

  return { header, entries, raw: content, errors };
}

function pushEntry(entries, currentEntry, errors, lineNum) {
  if (!currentEntry.title) {
    errors.push(`Line ${lineNum}: Entry ${currentEntry.number} has no title.`);
  }
  if (!currentEntry.lines.length) {
    errors.push(`Entry ${currentEntry.number}: no body content.`);
  }
  entries.push(currentEntry);
}

function main() {
  const args = process.argv.slice(2);
  let exitCode = 0;
  let files = [];

  if (args.length === 0) {
    // Validate all digest files
    const root = path.resolve(__dirname, '..');
    const types = ['arxiv', 'web-science'];
    for (const t of types) {
      const dir = path.join(root, t);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith('.md') && f !== 'README.md') {
          files.push({ file: path.join(dir, f), type: t });
        }
      }
    }
  } else {
    for (const arg of args) {
      const type = arg.includes('web-science') ? 'web-science' : 'arxiv';
      files.push({ file: path.resolve(arg), type });
    }
  }

  let totalErrors = 0;
  let totalFiles = 0;

  for (const { file, type } of files) {
    const content = fs.readFileSync(file, 'utf8');
    const result = parseDigest(content, type);
    totalFiles++;

    if (result.errors.length === 0) {
      console.log(`✅ ${path.basename(file)} — ${result.entries.length} entries OK`);
    } else {
      exitCode = 1;
      totalErrors += result.errors.length;
      console.log(`\n❌ ${path.basename(file)} — ${result.errors.length} error(s):`);
      for (const err of result.errors) {
        console.log(`   • ${err}`);
      }
    }
  }

  console.log(`\n${totalFiles} file(s) checked, ${totalErrors} error(s) total.`);
  process.exit(exitCode);
}

main();

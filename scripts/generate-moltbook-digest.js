const fs = require('fs');
const path = require('path');

/**
 * Generate moltbook digest from research log.
 * Reads ~/.openclaw/logs/moltbook-research.md and creates moltbook/YYYY-MM-DD.md
 */

const LOG_PATH = path.join(process.env.HOME || '/home/cloudy', '.openclaw', 'logs', 'moltbook-research.md');
const MOLTBOOK_DIR = path.join(__dirname, '..', 'moltbook');
const MANIFEST_PATH = path.join(MOLTBOOK_DIR, 'manifest.json');

function parseLog(content) {
  const entries = [];
  const blocks = content.split(/\n---\s*\n/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(/^##\s+(\d{4}-\d{2}-\d{2})/m);
    if (!dateMatch) continue;

    const date = dateMatch[1];

    const submoltMatch = trimmed.match(/^##\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+IST\s+—\s+(.+)/m);
    const submolt = submoltMatch ? submoltMatch[1].trim() : 'unknown';

    const postMatch = trimmed.match(/\*\*Post:\*\*\s*(.+)/m);
    const post = postMatch ? postMatch[1].trim() : '';

    const authorMatch = trimmed.match(/by\s+@(\w+)/);
    const author = authorMatch ? authorMatch[1] : '';

    const urlMatch = trimmed.match(/\*\*URL:\*\*\s*(\S+)/m);
    const url = urlMatch ? urlMatch[1].trim() : '';

    const whyMatch = trimmed.match(/\*\*Why it matters:\*\*\s*([\s\S]*?)(?=\*\*Key insight:\*\*)/m);
    const why = whyMatch ? whyMatch[1].trim() : '';

    const insightMatch = trimmed.match(/\*\*Key insight:\*\*\s*([\s\S]*?)(?=\*\*Engagement:\*\*)/m);
    const insight = insightMatch ? insightMatch[1].trim() : '';

    const engagementMatch = trimmed.match(/\*\*Engagement:\*\*\s*(.+)/m);
    const engagement = engagementMatch ? engagementMatch[1].trim() : '';

    entries.push({ date, submolt, post, author, url, why, insight, engagement });
  }

  // Group by date
  const byDate = {};
  for (const e of entries) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }

  return byDate;
}

function generateDigest(date, entries) {
  const lines = [
    `# Moltbook Research Digest — ${date}`,
    '',
    `**Items found:** ${entries.length}`,
    `**Submolts:** ${[...new Set(entries.map(e => e.submolt))].join(', ')}`,
    '',
    '---',
    ''
  ];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    lines.push(`## ${i + 1}. ${e.post}`);
    lines.push('');
    lines.push(`- **Author:** @${e.author}`);
    lines.push(`- **Submolt:** ${e.submolt}`);
    lines.push(`- **URL:** ${e.url}`);
    lines.push(`- **Why it matters:** ${e.why}`);
    lines.push(`- **Key insight:** ${e.insight}`);
    lines.push(`- **Engagement:** ${e.engagement}`);
    lines.push(`- **Tags:** moltbook, ${e.submolt}${e.submolt === 'agents' ? ', agent-architecture' : ''}${e.submolt === 'builds' ? ', implementation' : ''}`);
    lines.push('');
  }

  return lines.join('\n');
}

function updateManifest(files) {
  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  for (const f of files) {
    if (!manifest.includes(f)) {
      manifest.push(f);
    }
  }

  manifest.sort().reverse();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Updated manifest: ${manifest.length} files`);
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.log(`No log file at ${LOG_PATH}`);
    return;
  }

  const content = fs.readFileSync(LOG_PATH, 'utf8');
  const byDate = parseLog(content);

  const newFiles = [];
  for (const [date, entries] of Object.entries(byDate)) {
    const digest = generateDigest(date, entries);
    const fileName = `${date}.md`;
    const filePath = path.join(MOLTBOOK_DIR, fileName);
    fs.writeFileSync(filePath, digest);
    newFiles.push(fileName);
    console.log(`Generated: moltbook/${fileName} (${entries.length} entries)`);
  }

  updateManifest(newFiles);
}

main();

const fs = require('fs');
const path = require('path');

/** 
 * Generate moltbook digest from research log.
 * Reads ~/.openclaw/logs/moltbook-research.md and creates moltbook/YYYY-MM-DD.md
 * 
 * The log format is freeform markdown. We extract entries by looking for
 * numbered items with titles and URLs.
 */

const LOG_PATH = path.join(process.env.HOME || '/home/cloudy', '.openclaw', 'logs', 'moltbook-research.md');
const MOLTBOOK_DIR = path.join(__dirname, '..', 'moltbook');
const VIEWER_MOLTBOOK_DIR = path.join(__dirname, '..', 'viewer', 'moltbook');
const MANIFEST_PATH = path.join(MOLTBOOK_DIR, 'manifest.json');

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function parseLog(content) {
  const today = getTodayDate();
  const lines = content.split('\n');
  const entries = [];
  
  let currentEntry = null;
  let inEntry = false;
  let entryNum = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect numbered entry headers like "### 1. Title" or "### N. Title"
    const headerMatch = trimmed.match(/^#{1,3}\s+(\d+)\.\s+(.+)/);
    if (headerMatch) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      entryNum++;
      currentEntry = {
        date: today,
        number: entryNum,
        title: headerMatch[2].trim(),
        source: '',
        url: '',
        keyIdea: '',
        whyItMatters: '',
        tags: ['moltbook']
      };
      inEntry = true;
      continue;
    }
    
    if (!inEntry || !currentEntry) continue;
    
    // Extract URL
    const urlMatch = trimmed.match(/\*\*Link:\*\*\s*(\S+)/) || trimmed.match(/\*\*URL:\*\*\s*(\S+)/);
    if (urlMatch && !currentEntry.url) {
      currentEntry.url = urlMatch[1].trim();
      continue;
    }
    
    // Extract source (the bold header before the title)
    const sourceMatch = trimmed.match(/^-\s+\*\*([^*]+?)\*\*/);
    if (sourceMatch && !currentEntry.source) {
      const source = sourceMatch[1].trim();
      // Don't capture if it's just "Title:"
      if (!source.toLowerCase().startsWith('title')) {
        currentEntry.source = source;
      }
      continue;
    }
    
    // Extract key idea
    const ideaMatch = trimmed.match(/\*\*Key idea:\*\*\s*(.+)/) || trimmed.match(/\*\*Key Idea:\*\*\s*(.+)/);
    if (ideaMatch) {
      currentEntry.keyIdea = ideaMatch[1].trim();
      continue;
    }
    
    // Extract why it matters
    const whyMatch = trimmed.match(/\*\*Why it matters:\*\*\s*(.+)/);
    if (whyMatch) {
      currentEntry.whyItMatters = whyMatch[1].trim();
      continue;
    }
    
    // Detect arXiv IDs for tags
    const arxivMatch = trimmed.match(/arXiv:(\d{4}\.\d{5})/);
    if (arxivMatch) {
      currentEntry.tags.push('arxiv');
    }
    
    // Detect quantum-related tags
    if (/quantum|physics|llm|agent/i.test(trimmed)) {
      if (!currentEntry.tags.includes('quantum')) currentEntry.tags.push('quantum');
    }
    if (/agent/i.test(trimmed) && !currentEntry.tags.includes('agents')) {
      currentEntry.tags.push('agents');
    }
    if (/llm|language.model|gpt/i.test(trimmed) && !currentEntry.tags.includes('llms')) {
      currentEntry.tags.push('llms');
    }
  }
  
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return entries;
}

function generateDigest(date, entries) {
  const lines = [
    `# Moltbook Research Digest — ${date}`,
    '',
    `**Items found:** ${entries.length}`,
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '---',
    ''
  ];

  for (const e of entries) {
    lines.push(`## ${e.number}. ${e.title}`);
    lines.push('');
    
    if (e.source) lines.push(`- **Source:** ${e.source}`);
    if (e.url) lines.push(`- **URL:** ${e.url}`);
    if (e.keyIdea) lines.push(`- **Key idea:** ${e.keyIdea}`);
    if (e.whyItMatters) lines.push(`- **Why it matters:** ${e.whyItMatters}`);
    lines.push(`- **Tags:** ${[...new Set(e.tags)].join(', ')}`);
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
  return manifest;
}

function syncToViewer(fileName, manifest) {
  fs.mkdirSync(VIEWER_MOLTBOOK_DIR, { recursive: true });
  const srcFile = path.join(MOLTBOOK_DIR, fileName);
  const destFile = path.join(VIEWER_MOLTBOOK_DIR, fileName);
  const srcManifest = MANIFEST_PATH;
  const destManifest = path.join(VIEWER_MOLTBOOK_DIR, 'manifest.json');
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Synced to viewer: viewer/moltbook/${fileName}`);
  }
  
  fs.writeFileSync(destManifest, JSON.stringify(manifest, null, 2));
  console.log('Synced manifest to viewer');
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.log(`No log file at ${LOG_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(LOG_PATH, 'utf8');
  const entries = parseLog(content);
  
  if (entries.length === 0) {
    console.log('No entries found in log file');
    return;
  }

  const date = getTodayDate();
  const digest = generateDigest(date, entries);
  const fileName = `${date}.md`;
  const filePath = path.join(MOLTBOOK_DIR, fileName);
  
  fs.mkdirSync(MOLTBOOK_DIR, { recursive: true });
  fs.writeFileSync(filePath, digest);
  console.log(`Generated: moltbook/${fileName} (${entries.length} entries)`);

  const manifest = updateManifest([fileName]);
  syncToViewer(fileName, manifest);
}

main();

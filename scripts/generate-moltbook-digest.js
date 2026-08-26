const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Generate today's digest from validated, fresh Moltbook API posts.
 * The historical freeform research log is intentionally not an input: it
 * contains external research and cannot prove that an item came from Moltbook.
 */

const MOLTBOOK_DIR = path.join(__dirname, '..', 'moltbook');
const VIEWER_MOLTBOOK_DIR = path.join(__dirname, '..', 'viewer', 'moltbook');
const MANIFEST_PATH = path.join(MOLTBOOK_DIR, 'manifest.json');
const RAW_DIR = path.join(os.homedir(), '.openclaw', 'logs', 'moltbook-research-data');

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function generateDigest(date, entries) {
  const lines = [
    `# Moltbook Research Digest — ${date}`,
    '',
    `**Items found:** ${entries.length}`,
    '**Source:** Moltbook API (validated builds and agents submolts)',
    `**Generated:** ${new Date().toISOString()}`,
    '',
    '---',
    ''
  ];

  if (entries.length === 0) {
    lines.push('**Status:** No new valid Moltbook posts matched the research focus in the last 36 hours.');
    lines.push('');
    return lines.join('\n');
  }

  for (const entry of entries) {
    lines.push(`## ${entry.number}. ${entry.title}`);
    lines.push('');
    lines.push(`- **Source:** Moltbook / ${entry.submolt} · @${entry.author}`);
    lines.push(`- **URL:** ${entry.url}`);
    lines.push(`- **Key idea:** ${entry.keyIdea}`);
    lines.push(`- **Why it matters:** ${entry.whyItMatters}`);
    lines.push(`- **Tags:** ${['moltbook', entry.submolt, ...entry.topics].filter((tag, index, all) => all.indexOf(tag) === index).join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

function updateManifest(files) {
  let manifest = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }

  for (const file of files) {
    if (!manifest.includes(file)) manifest.push(file);
  }
  manifest.sort().reverse();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  return manifest;
}

function syncToViewer(fileName, manifest) {
  fs.mkdirSync(VIEWER_MOLTBOOK_DIR, { recursive: true });
  fs.copyFileSync(path.join(MOLTBOOK_DIR, fileName), path.join(VIEWER_MOLTBOOK_DIR, fileName));
  fs.writeFileSync(path.join(VIEWER_MOLTBOOK_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

async function main() {
  const { getResearchPosts } = await import('./moltbook-client.mjs');
  const date = getTodayDate();
  const result = await getResearchPosts({ limit: 25, sinceHours: 36 });

  // Keep the API response outside the public repo/viewer for provenance and
  // later debugging. It includes raw post content, so keep it private.
  fs.mkdirSync(RAW_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(
    path.join(RAW_DIR, `${date}.json`),
    JSON.stringify({ retrieved_at: new Date().toISOString(), feeds: result.feeds }, null, 2),
    { mode: 0o600 }
  );

  // Keep the digest readable while retaining the full API response privately.
  const entries = result.posts.slice(0, 12).map((post, index) => {
    const excerpt = post.content.replace(/\s+/g, ' ').trim();
    return {
      number: index + 1,
      ...post,
      title: post.title.replace(/\s+/g, ' ').trim(),
      keyIdea: (excerpt || post.title).slice(0, 360).trim(),
      whyItMatters: `A fresh post from the ${post.submolt} submolt matching the research focus: ${post.topics.join(', ')}.`
    };
  });

  const fileName = `${date}.md`;
  fs.mkdirSync(MOLTBOOK_DIR, { recursive: true });
  fs.writeFileSync(path.join(MOLTBOOK_DIR, fileName), generateDigest(date, entries));
  const manifest = updateManifest([fileName]);
  syncToViewer(fileName, manifest);
  console.log(`Generated: moltbook/${fileName} (${entries.length} validated Moltbook entries)`);
}

main().catch(error => {
  console.error(`Moltbook digest failed: ${error.message}`);
  process.exit(1);
});

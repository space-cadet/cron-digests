import * as workflow from './lib/workflow.js';
import * as sqlite from './lib/sqlite.js';

await sqlite.openDb(':memory:');

const result = await workflow.recordSessionWork({
  task_id: 'T13',
  task_description: 'Moltbook Research Stream Integration into Viewer',
  files_modified: [
    { action: 'Created', path: 'moltbook/2026-05-25.md', description: 'First Moltbook digest (4 entries)' },
    { action: 'Created', path: 'moltbook/manifest.json', description: 'Manifest tracking Moltbook digests' },
    { action: 'Created', path: 'scripts/generate-moltbook-digest.js', description: 'Parser converting research log to digest' },
    { action: 'Modified', path: 'scripts/build-index.js', description: "Added 'moltbook' to types array" },
    { action: 'Modified', path: 'viewer/index.html', description: 'Moltbook rendering (amber badge, submolt chips)' },
    { action: 'Modified', path: '.github/workflows/ci.yml', description: 'git add -A covers moltbook/' }
  ],
  task_status: 'completed',
  session_period: 'morning',
  regenerate_markdown: false
});

console.log('Result:', JSON.stringify(result, null, 2));

const tasks = await sqlite.queryAll('SELECT id, status FROM task_items WHERE id = "T13"');
console.log('T13 in DB:', tasks);

await sqlite.closeDb();

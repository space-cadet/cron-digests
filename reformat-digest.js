#!/usr/bin/env node
/**
 * Reformat digests to uniform v2.0 format
 * Usage: node reformat-digest.js <input.md> <output.md> <type>
 * type: arxiv | web-science
 */

const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = process.argv[3];
const type = process.argv[4];

if (!input || !output || !type) {
  console.error('Usage: node reformat-digest.js <input.md> <output.md> <arxiv|web-science>');
  process.exit(1);
}

const content = fs.readFileSync(input, 'utf8');
const lines = content.split('\n');
const date = path.basename(input, '.md');

// Extract info from existing content
let categories = '';
let sites = '';
let itemsFound = 0;
let focus = '';

// Try to extract existing metadata
const catMatch = content.match(/\*\*?Categories:\*\*?\s*([^\n]+)/);
if (catMatch) categories = catMatch[1].trim();

const sitesMatch = content.match(/\*\*?Sites:\*\*?\s*([^\n]+)/);
if (sitesMatch) sites = sitesMatch[1].trim();

const itemsMatch = content.match(/\*\*?Items found:\*\*?\s*(\d+)/);
if (itemsMatch) itemsFound = parseInt(itemsMatch[1]);

const focusMatch = content.match(/\*\*?Focus:\*\*?\s*([^\n]+)/);
if (focusMatch) focus = focusMatch[1].trim();

// Count entries (## N. or ### N.)
const entryMatches = content.matchAll(/^(##|###)\s+(\d+)\.\s*/gm);
const entries = [...entryMatches];
if (itemsFound === 0) itemsFound = entries.length;

// Extract focus from titles if not found
if (!focus) {
  const titles = content.matchAll(/^##?#?\s+\d+\.\s+(.+)$/gm);
  const titleList = [...titles].map(m => m[1]).slice(0, 3);
  focus = titleList.join(', ').substring(0, 80) || 'various topics';
}

// Build output
let out = [];
out.push(`# ${type === 'arxiv' ? 'arXiv' : 'Web Science'} Digest — ${date}`);
out.push('');

if (type === 'arxiv') {
  out.push(`**Categories:** ${categories || 'hep-th, gr-qc, quant-ph'}`);
} else {
  out.push(`**Sites:** ${sites || 'Phys.org + ScienceDaily'}`);
}

out.push(`**Items found:** ${itemsFound}`);
out.push(`**Focus:** ${focus}`);
out.push('');

// Extract and reformat entries
let currentEntry = [];
let entryNum = 0;
let inEntry = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check for entry start (## N. or ### N.)
  const entryStart = line.match(/^(##|###)\s+(\d+)\.\s*(.*)/);
  
  if (entryStart) {
    // Save previous entry
    if (currentEntry.length > 0) {
      out.push(...currentEntry);
      out.push('---');
      out.push('');
    }
    
    // Start new entry with normalized ## N. format
    entryNum = parseInt(entryStart[2]);
    currentEntry = [`## ${entryNum}. ${entryStart[3]}`];
    inEntry = true;
  } else if (inEntry) {
    // Skip old section headers (## without number)
    if (line.match(/^##\s+[^0-9]/)) {
      continue;
    }
    currentEntry.push(line);
  }
}

// Save last entry
if (currentEntry.length > 0) {
  out.push(...currentEntry);
}

// Write output
fs.writeFileSync(output, out.join('\n'));
console.log(`Reformatted: ${input} → ${output} (${itemsFound} items)`);

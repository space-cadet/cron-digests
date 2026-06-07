#!/bin/bash
# arxiv-digest-generator.sh - Full arXiv digest generator
# Run from cron-digests repo. Does everything in bash/python, minimal agent work.
set -euo pipefail

REPO="/home/cloudy/.openclaw/workspace/code/cron-digests"
cd "$REPO"

# Ensure git is clean
git pull origin main || true

# Step 1: Pre-fetch arXiv HTML data
python3 scripts/fetch-arxiv-html.py /tmp/arxiv-digest-data.json
if [ ! -s /tmp/arxiv-digest-data.json ]; then
    echo "ERROR: Pre-fetch failed - no data"
    exit 1
fi

# Step 2: Deduplicate and select
python3 << 'PYEOF'
import json, os, sys, re
from datetime import datetime, timezone

data = json.load(open('/tmp/arxiv-digest-data.json'))
seen = set()
seen_file = 'arxiv/seen-urls.json'
if os.path.exists(seen_file):
    seen = set(json.load(open(seen_file)))

unique = []
for p in data['papers']:
    aid = p['arxiv_id']
    if aid in seen:
        continue
    seen.add(aid)
    unique.append(p)

keywords = [
    'quantum gravity', 'loop quantum', 'black hole', 'quantum cosmology',
    'quantum computing', 'condensed matter', 'topological', 'many-body',
    'holograph', 'string theory', 'entanglement', 'tensor network',
    'spin foam', 'isolated horizon', 'quantum hall', 'anyon'
]

def score(p):
    s = 0
    text = (p.get('title', '') + ' ' + ' '.join(p.get('categories', []))).lower()
    for kw in keywords:
        if kw in text:
            s += 1
    cats = ' '.join(p.get('categories', [])).lower()
    if 'gr-qc' in cats: s += 2
    if 'hep-th' in cats: s += 2
    if 'quant-ph' in cats: s += 1
    return s

scored = [(score(p), p) for p in unique]
scored.sort(reverse=True)
selected = scored[:15]

selection = {
    'selected': [p for _, p in selected],
    'total_unique': len(unique),
    'selected_count': len(selected),
    'date': datetime.now(timezone.utc).strftime('%Y-%m-%d')
}
json.dump(selection, open('/tmp/arxiv-selection.json', 'w'), indent=2)
print(f"Selected {len(selected)} papers from {len(unique)} unique")
PYEOF

if [ ! -s /tmp/arxiv-selection.json ]; then
    echo "ERROR: Selection failed"
    exit 1
fi

# Step 3: Fetch abstracts
python3 << 'PYEOF'
import json, urllib.request, time, sys, re

selection = json.load(open('/tmp/arxiv-selection.json'))
papers = selection['selected']

for p in papers:
    aid = p['arxiv_id']
    url = f"https://arxiv.org/abs/{aid}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Cloudy-Bot/1.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8', errors='replace')
            m = re.search(r'<blockquote class="abstract mathjax">.*?<p>(.*?)</p>.*?</blockquote>', html, re.DOTALL)
            if m:
                abstract = re.sub(r'<[^>]+>', '', m.group(1)).strip()
                p['abstract'] = abstract
            else:
                p['abstract'] = '[Abstract extraction failed]'
            break
        except Exception as e:
            if attempt == 2:
                p['abstract'] = f'[Failed to fetch: {e}]'
            time.sleep(2)
    time.sleep(0.5)

json.dump(selection, open('/tmp/arxiv-selection.json', 'w'), indent=2)
print(f"Fetched abstracts for {len(papers)} papers")
PYEOF

# Step 4: Generate markdown digest
python3 << 'PYEOF'
import json, os, re
from datetime import datetime, timezone

selection = json.load(open('/tmp/arxiv-selection.json'))
papers = selection['selected']

today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

if not os.path.exists('TEMPLATE.md'):
    print("ERROR: TEMPLATE.md not found")
    sys.exit(1)

template = open('TEMPLATE.md').read()

sections = []
for p in papers:
    aid = p['arxiv_id']
    title = p.get('title', 'Untitled')
    authors = ', '.join(p.get('authors', [])[:3])
    if len(p.get('authors', [])) > 3:
        authors += ' et al.'
    cats = ', '.join(p.get('categories', []))
    abstract = p.get('abstract', '[No abstract]')
    
    sentences = re.split(r'(?<=[.!?])\s+', abstract)
    summary = ' '.join(sentences[:2]).strip()
    if not summary:
        summary = abstract[:200] + '...' if len(abstract) > 200 else abstract
    
    tags = []
    text = (title + ' ' + abstract).lower()
    tag_map = {
        'quantum gravity': 'quantum-gravity', 'loop quantum': 'loop-quantum-gravity',
        'black hole': 'black-holes', 'quantum cosmology': 'quantum-cosmology',
        'quantum computing': 'quantum-computing', 'condensed matter': 'condensed-matter',
        'topological': 'topological', 'many-body': 'many-body',
        'holograph': 'holography', 'string theory': 'string-theory',
        'entanglement': 'entanglement', 'tensor network': 'tensor-networks'
    }
    for kw, tag in tag_map.items():
        if kw in text:
            tags.append(f'`{tag}`')
    if not tags:
        tags = ['`physics`']
    
    section = f"""### [{title}](https://arxivite.org/abs/{aid})
**Authors:** {authors}
**arXiv:** {aid} | **Categories:** {cats}
**Abstract:** {abstract}
**Summary:** {summary}
**Relevance:** {', '.join(tags)}
"""
    sections.append(section)

digest = template.replace('{{date}}', today).replace('{{papers}}', '\n\n'.join(sections))

out_file = f'arxiv/{today}.md'
open(out_file, 'w').write(digest)

manifest = []
if os.path.exists('arxiv/manifest.json'):
    manifest = json.load(open('arxiv/manifest.json'))
if out_file not in manifest:
    manifest.append(out_file)
    json.dump(manifest, open('arxiv/manifest.json', 'w'), indent=2)

seen = set()
if os.path.exists('arxiv/seen-urls.json'):
    seen = set(json.load(open('arxiv/seen-urls.json')))
for p in papers:
    seen.add(p['arxiv_id'])
json.dump(sorted(seen), open('arxiv/seen-urls.json', 'w'), indent=2)

print(f"Digest written: {out_file}")
print(f"Papers: {len(papers)}")
print(f"Total seen: {len(seen)}")
PYEOF

# Step 5: Build index
node scripts/build-index.js

# Step 6: Git commit and push
git add -A
git commit -m "arxiv: $(date +%Y-%m-%d)" || true
git push origin main || true

echo "SUCCESS: Digest generated and committed"

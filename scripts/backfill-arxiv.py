#!/usr/bin/env python3
"""
Backfill arXiv digests for specific dates using the arXiv API.
Usage: python3 backfill-arxiv.py YYYY-MM-DD
"""
import json
import urllib.request
import re
import sys
import os
from datetime import datetime, timezone, timedelta

REPO = "/home/cloudy/.openclaw/workspace/code/cron-digests"

def fetch_arxiv_for_date(date_str):
    """Fetch papers submitted on a specific date using arXiv API."""
    # Convert YYYY-MM-DD to API format
    start_dt = datetime.strptime(date_str, "%Y-%m-%d")
    end_dt = start_dt + timedelta(days=1)
    
    start_str = start_dt.strftime("%Y%m%d%H%M%S")
    end_str = end_dt.strftime("%Y%m%d%H%M%S")
    
    # Query for physics categories
    categories = ["hep-th", "gr-qc", "quant-ph", "cond-mat"]
    cat_query = " OR ".join(f"cat:{c}" for c in categories)
    query = f"({cat_query}) AND submittedDate:[{start_str} TO {end_str}]"
    
    url = f"http://export.arxiv.org/api/query?search_query={urllib.parse.quote(query)}&start=0&max_results=200&sortBy=submittedDate&sortOrder=descending"
    
    print(f"Fetching: {url}", file=sys.stderr)
    req = urllib.request.Request(url, headers={'User-Agent': 'Cloudy-Bot/1.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        xml = resp.read().decode('utf-8', errors='replace')
    
    # Parse Atom XML
    entries = []
    entry_pattern = re.compile(r'<entry>(.*?)</entry>', re.DOTALL)
    
    for match in entry_pattern.finditer(xml):
        entry_xml = match.group(1)
        
        # ID
        id_match = re.search(r'<id>([^<]+)</id>', entry_xml)
        arxiv_id = id_match.group(1).split('/')[-1] if id_match else ""
        if 'v' in arxiv_id:
            arxiv_id = arxiv_id[:arxiv_id.rindex('v')]
        
        # Title
        title_match = re.search(r'<title>(.*?)</title>', entry_xml, re.DOTALL)
        title = title_match.group(1).strip() if title_match else "Untitled"
        title = re.sub(r'\s+', ' ', title)
        
        # Authors
        authors = []
        for author_match in re.finditer(r'<name>([^<]+)</name>', entry_xml):
            authors.append(author_match.group(1).strip())
        
        # Summary (abstract)
        summary_match = re.search(r'<summary>(.*?)</summary>', entry_xml, re.DOTALL)
        abstract = summary_match.group(1).strip() if summary_match else ""
        abstract = re.sub(r'\s+', ' ', abstract)
        
        # Categories
        categories = []
        for cat_match in re.finditer(r'<category term="([^"]+)"', entry_xml):
            categories.append(cat_match.group(1))
        
        # Published date
        pub_match = re.search(r'<published>([^<]+)</published>', entry_xml)
        published = pub_match.group(1) if pub_match else ""
        
        entries.append({
            "arxiv_id": arxiv_id,
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "categories": categories,
            "published": published
        })
    
    return entries

def score_paper(p):
    keywords = [
        'quantum gravity', 'loop quantum', 'black hole', 'quantum cosmology',
        'quantum computing', 'condensed matter', 'topological', 'many-body',
        'holograph', 'string theory', 'entanglement', 'tensor network',
        'spin foam', 'isolated horizon', 'quantum hall', 'anyon'
    ]
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

def generate_digest(date_str, papers):
    os.makedirs(f"{REPO}/arxiv", exist_ok=True)
    
    scored = [(score_paper(p), i, p) for i, p in enumerate(papers)]
    scored.sort(reverse=True)
    selected = [p for _, _, p in scored[:15]]
    
    categories = sorted(set(cat for p in selected for cat in p.get('categories', [])))
    
    focus_keywords = []
    text_all = ' '.join(p.get('title', '') + ' ' + p.get('abstract', '') for p in selected).lower()
    for kw in ['quantum gravity', 'loop quantum', 'black hole', 'quantum cosmology', 'quantum computing', 'holograph', 'string theory', 'topological', 'many-body', 'entanglement', 'tensor network', 'condensed matter']:
        if kw in text_all:
            focus_keywords.append(kw)
    focus = ', '.join(focus_keywords[:6]) if focus_keywords else 'physics'
    
    header = f"""# arXiv Morning Digest — {date_str}

**Categories:** {', '.join(categories)}
**Items found:** {len(selected)}
**Focus:** {focus}

---
"""
    
    sections = []
    for idx, p in enumerate(selected, 1):
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
                tags.append(tag)
        if not tags:
            tags = ['physics']
        
        section = f"""## {idx}. {title}
- **Authors:** {authors}
- **arXiv ID:** {aid}
- **URL:** https://arxivite.org/abs/{aid}
- **Categories:** {cats}
- **Abstract:** {abstract}
- **Summary:** {summary}
- **Relevance:** {', '.join(tags)}
- **Tags:** {', '.join(tags)}"""
        sections.append(section)
    
    digest = header + '\n\n---\n\n'.join(sections) + '\n'
    
    out_file = f'{REPO}/arxiv/{date_str}.md'
    with open(out_file, 'w') as f:
        f.write(digest)
    
    # Update manifest
    manifest = []
    manifest_file = f'{REPO}/arxiv/manifest.json'
    if os.path.exists(manifest_file):
        manifest = json.load(open(manifest_file))
    if out_file not in manifest:
        manifest.append(out_file)
        with open(manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
    
    print(f"Digest written: {out_file}")
    print(f"Papers: {len(selected)} of {len(papers)}")
    return out_file

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 backfill-arxiv.py YYYY-MM-DD", file=sys.stderr)
        sys.exit(1)
    
    date_str = sys.argv[1]
    print(f"Backfilling arXiv digest for {date_str}...", file=sys.stderr)
    
    papers = fetch_arxiv_for_date(date_str)
    if not papers:
        print(f"No papers found for {date_str}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Found {len(papers)} papers", file=sys.stderr)
    out_file = generate_digest(date_str, papers)
    print(out_file)

if __name__ == "__main__":
    main()

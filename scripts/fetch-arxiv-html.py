#!/usr/bin/env python3
"""
Pre-fetch arXiv recent submissions via HTML scrape + curl.

Usage: python3 fetch-arxiv-html.py <output.json>

Fetches recent submission pages for hep-th, gr-qc, quant-ph, cond-mat,
extracts paper metadata with regex (no external deps), and writes JSON.

Advantages over API:
- No rate limits observed for HTML pages
- No API key needed
- Gets the exact same "recent" view as the arXiv browse pages
"""

import json
import re
import subprocess
import sys
from datetime import datetime, timezone

CATEGORIES = ["hep-th", "gr-qc", "quant-ph", "cond-mat"]

def fetch_html(category):
    url = f"https://arxiv.org/list/{category}/recent"
    result = subprocess.run(
        ["curl", "-s", "-L", "--max-time", "30", "-A", "Mozilla/5.0", url],
        capture_output=True,
        text=True,
        timeout=45
    )
    if result.returncode != 0:
        raise RuntimeError(f"curl failed for {category}: {result.stderr}")
    return result.stdout

def extract_papers(html, category):
    papers = []
    
    # Find the announcement date
    date_match = re.search(r'<h3>([^<]+)</h3>', html)
    announcement_date = date_match.group(1).strip() if date_match else "unknown"
    
    # Each paper entry: <dt>...</dt> followed by <dd>...</dd>
    # Use a combined pattern to match dt+dd pairs
    entry_pattern = re.compile(
        r'<dt[^\u003e]*>(.*?)</dt>\s*<dd[^\u003e]*>(.*?)</dd>',
        re.DOTALL
    )
    
    for match in entry_pattern.finditer(html):
        dt = match.group(1)
        dd = match.group(2)
        
        paper = {"source_category": category, "announcement_date": announcement_date}
        
        # arXiv ID - pattern: href ="/abs/2606.05155" or href="/abs/2606.05155"
        id_match = re.search(r'href\s*=\s*"/?abs/([\d.]+)"', dt)
        if id_match:
            paper["arxiv_id"] = id_match.group(1)
        else:
            continue  # skip if no ID
        
        # Title - pattern: <div class='list-title mathjax'><span class='descriptor'>Title:</span> ... </div>
        title_match = re.search(
            r"<div\s+class\s*=\s*['\"]list-title[^'\"]*['\"]\u003e\s*<span\s+class\s*=\s*['\"]descriptor['\"]\u003eTitle:\u003c/span\u003e\s*(.*?)\u003c/div\u003e",
            dd, re.DOTALL
        )
        if title_match:
            title = title_match.group(1)
            # Strip HTML tags and normalize whitespace
            title = re.sub(r'<[^>]+\u003e', '', title)
            title = re.sub(r'\s+', ' ', title).strip()
            paper["title"] = title
        else:
            paper["title"] = ""
        
        # Authors - pattern: <div class='list-authors'>...<a href="...">Name</a>...</div>
        authors = []
        authors_match = re.search(
            r"<div\s+class\s*=\s*['\"]list-authors['\"]\u003e(.*?)\u003c/div\u003e",
            dd, re.DOTALL
        )
        if authors_match:
            authors_html = authors_match.group(1)
            for author_match in re.finditer(r'<a[^\u003e]*\u003e([^\u003c]+)\u003c/a\u003e', authors_html):
                authors.append(author_match.group(1).strip())
        paper["authors"] = authors
        
        # Comments
        comments_match = re.search(
            r"<div\s+class\s*=\s*['\"]list-comments[^'\"]*['\"]\u003e\s*<span\s+class\s*=\s*['\"]descriptor['\"]\u003eComments:\u003c/span\u003e\s*(.*?)\u003c/div\u003e",
            dd, re.DOTALL
        )
        if comments_match:
            comment = re.sub(r'<[^\u003e]+\u003e', '', comments_match.group(1))
            paper["comment"] = re.sub(r'\s+', ' ', comment).strip()
        else:
            paper["comment"] = ""
        
        # Categories / Subjects
        categories = []
        cat_match = re.search(
            r"<div\s+class\s*=\s*['\"]list-subjects[^'\"]*['\"]\u003e\s*<span\s+class\s*=\s*['\"]descriptor['\"]\u003eSubjects:\u003c/span\u003e\s*(.*?)\u003c/div\u003e",
            dd, re.DOTALL
        )
        if cat_match:
            cat_text = cat_match.group(1)
            # Extract category codes from parenthetical expressions like (hep-th), (gr-qc), (math-ph)
            # arXiv format: "High Energy Physics - Theory (hep-th)"
            for cat in re.finditer(r'\(([a-zA-Z\-]+(?:\.[a-zA-Z\-]+)?)\)', cat_text):
                c = cat.group(1)
                if len(c) > 2 and (c.count('-') >= 1 or c.count('.') >= 1):
                    categories.append(c)
            # Fallback: also match bare codes (not in parentheses) if no parens found
            if not categories:
                for cat in re.finditer(r'(?<![a-zA-Z.])([a-zA-Z\-]+(?:\.[a-zA-Z\-]+)?)(?![a-zA-Z.])', cat_text):
                    c = cat.group(1)
                    skip = {'primary-subject', 'descriptor', 'span', 'class', 'div', 'http', 'https'}
                    if c.lower() in skip:
                        continue
                    if len(c) > 2 and (c.count('-') >= 1 or c.count('.') >= 1):
                        categories.append(c)
        paper["categories"] = list(set(categories))
        
        # Abstract link
        paper["abstract_url"] = f"https://arxiv.org/abs/{paper['arxiv_id']}"
        paper["pdf_url"] = f"https://arxiv.org/pdf/{paper['arxiv_id']}"
        
        papers.append(paper)
    
    return papers

def main():
    output_file = sys.argv[1] if len(sys.argv) > 1 else "/tmp/arxiv-html-data.json"
    
    all_papers = []
    for cat in CATEGORIES:
        print(f"Fetching {cat}...", file=sys.stderr)
        try:
            html = fetch_html(cat)
            papers = extract_papers(html, cat)
            print(f"  {cat}: {len(papers)} papers", file=sys.stderr)
            all_papers.extend(papers)
        except Exception as e:
            print(f"  {cat}: ERROR - {e}", file=sys.stderr)
    
    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": "arxiv.org/list/*/recent (HTML scrape)",
        "total_papers": len(all_papers),
        "papers": all_papers
    }
    
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Wrote {len(all_papers)} papers to {output_file}", file=sys.stderr)

if __name__ == "__main__":
    main()

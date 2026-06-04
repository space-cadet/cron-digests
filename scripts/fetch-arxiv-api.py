#!/usr/bin/env python3
"""
Pre-fetch arXiv API data for digest generation.

Usage: python3 fetch-arxiv-api.py <output.json> [max_results=100]

Fetches recent papers from hep-th, gr-qc, quant-ph, cond-mat via curl,
parses Atom XML, and writes a clean JSON with paper metadata.

This script is meant to be run OUTSIDE the agent session (via exec/cron)
to avoid web_fetch rate limits and reduce session file bloat.
"""

import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

def fetch_arxiv(max_results=100):
    url = (
        f"https://export.arxiv.org/api/query"
        f"?search_query=cat:hep-th+OR+cat:gr-qc+OR+cat:quant-ph+OR+cat:cond-mat"
        f"&start=0&max_results={max_results}"
        f"&sortBy=submittedDate&sortOrder=descending"
    )
    
    result = subprocess.run(
        ["curl", "-s", "-L", "-A", "Mozilla/5.0 (Cloudy/1.0; +https://quantumofgravity.com)", url],
        capture_output=True,
        text=True,
        timeout=60
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"curl failed: {result.stderr}")
    
    return result.stdout

def parse_atom(xml_text):
    root = ET.fromstring(xml_text)
    
    # Atom namespace
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    arxiv_ns = {"arxiv": "http://arxiv.org/schemas/atom"}
    
    papers = []
    
    for entry in root.findall("atom:entry", ns):
        paper = {}
        
        # ID (arXiv URL like http://arxiv.org/abs/2606.01234v1)
        id_elem = entry.find("atom:id", ns)
        if id_elem is not None:
            paper["id_url"] = id_elem.text
            # Extract bare ID
            id_text = id_elem.text
            if "/abs/" in id_text:
                paper["arxiv_id"] = id_text.split("/abs/")[-1].replace("v1", "").replace("v2", "")
            else:
                paper["arxiv_id"] = id_text
        
        # Title
        title = entry.find("atom:title", ns)
        paper["title"] = title.text.strip() if title is not None else ""
        
        # Summary (abstract)
        summary = entry.find("atom:summary", ns)
        paper["abstract"] = summary.text.strip() if summary is not None else ""
        
        # Authors
        authors = []
        for author in entry.findall("atom:author", ns):
            name = author.find("atom:name", ns)
            if name is not None:
                authors.append(name.text)
        paper["authors"] = authors
        
        # Categories
        categories = []
        for cat in entry.findall("atom:category", ns):
            term = cat.get("term")
            if term:
                categories.append(term)
        paper["categories"] = categories
        
        # Published date
        published = entry.find("atom:published", ns)
        if published is not None:
            paper["published"] = published.text
        
        # Comment
        comment = entry.find("arxiv:comment", arxiv_ns)
        paper["comment"] = comment.text if comment is not None else ""
        
        # Primary category
        primary = entry.find("arxiv:primary_category", arxiv_ns)
        if primary is not None:
            paper["primary_category"] = primary.get("term", "")
        
        papers.append(paper)
    
    return papers

def main():
    output_file = sys.argv[1] if len(sys.argv) > 1 else "/tmp/arxiv-api-data.json"
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    print(f"Fetching arXiv API (max_results={max_results})...", file=sys.stderr)
    xml_text = fetch_arxiv(max_results)
    
    print(f"Parsing {len(xml_text)} bytes of XML...", file=sys.stderr)
    papers = parse_atom(xml_text)
    
    # Add metadata
    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "source": "export.arxiv.org/api/query",
        "total_papers": len(papers),
        "papers": papers
    }
    
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Wrote {len(papers)} papers to {output_file}", file=sys.stderr)
    
    # Print date range
    if papers:
        dates = [p.get("published", "") for p in papers if p.get("published")]
        print(f"Date range: {min(dates)} to {max(dates)}", file=sys.stderr)

if __name__ == "__main__":
    main()

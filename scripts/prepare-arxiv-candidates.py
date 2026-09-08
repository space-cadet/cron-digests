#!/usr/bin/env python3
"""Prepare a deduplicated arXiv candidate pool for agent curation.

This script deliberately does not rank or select papers. Selection and
summarisation are editorial tasks performed by the digest agent.

Usage:
    python3 scripts/prepare-arxiv-candidates.py INPUT.json OUTPUT.json
"""

import json
import os
import sys
from collections import Counter


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: prepare-arxiv-candidates.py INPUT.json OUTPUT.json")

    input_path, output_path = sys.argv[1:]
    with open(input_path, encoding="utf-8") as handle:
        source = json.load(handle)

    seen_path = os.path.join(os.path.dirname(__file__), "..", "arxiv", "seen-urls.json")
    try:
        with open(os.path.abspath(seen_path), encoding="utf-8") as handle:
            seen = set(json.load(handle))
    except FileNotFoundError:
        seen = set()

    candidates = []
    ids = set()
    for paper in source.get("papers", []):
        arxiv_id = paper.get("arxiv_id")
        if not arxiv_id or arxiv_id in seen or arxiv_id in ids:
            continue
        ids.add(arxiv_id)
        candidates.append(paper)

    result = {
        "source": source.get("source"),
        "fetched_at": source.get("fetched_at"),
        "candidate_count": len(candidates),
        "papers": candidates,
    }
    with open(output_path, "w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2, ensure_ascii=False)

    categories = Counter(
        category
        for paper in candidates
        for category in paper.get("categories", [])
    )
    print(f"Prepared {len(candidates)} unseen candidates")
    print("Categories:", ", ".join(f"{name}={count}" for name, count in sorted(categories.items())))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Reject arXiv digests whose summaries are copied from their abstracts."""

import re
import sys


ENTRY_RE = re.compile(r"(?ms)^##\s+\d+\.\s+.*?(?=^##\s+\d+\.\s+|\Z)")
ABSTRACT_RE = re.compile(r"(?m)^- \*\*Abstract:\*\*\s*(.+)$")
SUMMARY_RE = re.compile(r"(?m)^- \*\*Summary:\*\*\s*(.+)$")


def normalize(value):
    return re.sub(r"\s+", " ", value).strip()


def is_extractively_copied(abstract, summary):
    abstract = normalize(abstract)
    summary = normalize(summary)
    if not summary:
        return True
    if summary == abstract:
        return True
    sentences = re.split(r"(?<=[.!?])\s+", abstract)
    first_two = normalize(" ".join(sentences[:2]))
    return summary == first_two or (len(summary) > 120 and abstract.startswith(summary))


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: check-arxiv-quality.py DIGEST.md")

    path = sys.argv[1]
    with open(path, encoding="utf-8") as handle:
        content = handle.read()

    failures = []
    entries = ENTRY_RE.findall(content)
    for number, entry in enumerate(entries, 1):
        abstract_match = ABSTRACT_RE.search(entry)
        summary_match = SUMMARY_RE.search(entry)
        if not abstract_match or not summary_match:
            failures.append(f"entry {number}: missing abstract or summary")
            continue
        if is_extractively_copied(abstract_match.group(1), summary_match.group(1)):
            failures.append(f"entry {number}: summary is copied from the abstract")

    if failures:
        print(f"QUALITY FAIL: {path}")
        for failure in failures:
            print(f"  - {failure}")
        return 1

    print(f"QUALITY OK: {path} ({len(entries)} entries have synthetic summaries)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

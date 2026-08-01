#!/usr/bin/env python3
"""
Re-inline styles/site.css into every HTML file that contains a
`<style data-inline-css>...</style>` block. Idempotent.

Usage:
    python3 scripts/tools/inline-css.py

Walks the repo root (excluding .git, node_modules, docs), finds every .html
with the marker block, and replaces its contents with the current site.css.
Prints a summary of files updated.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSS_PATH = ROOT / "styles" / "site.css"
SKIP_DIRS = {".git", "node_modules", "docs"}

BLOCK_RE = re.compile(
    r'(<style data-inline-css[^>]*>)(.*?)(</style>)',
    re.DOTALL | re.IGNORECASE,
)


def html_files(root: Path):
    for p in root.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.relative_to(root).parts):
            continue
        yield p


def main() -> int:
    if not CSS_PATH.exists():
        print(f"ERROR: {CSS_PATH} not found", file=sys.stderr)
        return 1
    css = CSS_PATH.read_text(encoding="utf-8")

    updated = 0
    skipped = 0
    for html in html_files(ROOT):
        text = html.read_text(encoding="utf-8")
        if not BLOCK_RE.search(text):
            skipped += 1
            continue
        new = BLOCK_RE.sub(lambda m: m.group(1) + "\n" + css + "\n" + m.group(3), text, count=1)
        if new != text:
            html.write_text(new, encoding="utf-8")
            updated += 1
            print(f"  inlined  → {html.relative_to(ROOT)}")
        else:
            print(f"  up-to-date → {html.relative_to(ROOT)}")
    print(f"\ninline-css: {updated} updated, {skipped} skipped (no marker block).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

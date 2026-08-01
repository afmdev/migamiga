#!/usr/bin/env python3
"""
Re-inline styles/site.css into every HTML file that contains a
`<style data-inline-css>...</style>` block. Idempotent.

Rewrites absolute /assets/ URLs inside the CSS to relative paths based on
the HTML file's depth from the repo root, so pages work when opened via
file:// (double-click) AND when served over http.

Usage:
    python3 scripts/tools/inline-css.py
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

# Matches url('/assets/…'), url("/assets/…"), url(/assets/…) — same for /scripts/, /styles/.
URL_ABS_RE = re.compile(r"""url\(\s*(['"]?)/(assets|scripts|styles)/""")


def html_files(root):
    for p in root.rglob("*.html"):
        if any(part in SKIP_DIRS for part in p.relative_to(root).parts):
            continue
        yield p


def rewrite_css_urls(css, html_path):
    """Rewrite /assets/ → relative prefix based on how deep the HTML lives."""
    depth = len(html_path.relative_to(ROOT).parts) - 1  # 0 for root files, 1 for de/, en/, es/
    prefix = "../" * depth if depth else ""
    def repl(m):
        quote = m.group(1)
        top = m.group(2)
        return f"url({quote}{prefix}{top}/"
    return URL_ABS_RE.sub(repl, css)


def main():
    if not CSS_PATH.exists():
        print(f"ERROR: {CSS_PATH} not found", file=sys.stderr)
        return 1
    css_source = CSS_PATH.read_text(encoding="utf-8")

    updated = 0
    skipped = 0
    for html in html_files(ROOT):
        text = html.read_text(encoding="utf-8")
        if not BLOCK_RE.search(text):
            skipped += 1
            continue
        css = rewrite_css_urls(css_source, html)
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

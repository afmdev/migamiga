#!/usr/bin/env python3
"""Build de/ en/ es/ it/ from the English root pages (home/about/faq/404.html).

Edit the English page, then run: python3 scripts/build_i18n.py
Translations live in scripts/i18n/<lang>.py as {english text: translation}.
Text nodes / alt / aria-label / title / content / JSON-LD strings are looked up by
their whitespace-collapsed, unescaped English text. Missing keys are reported.
"""
import html, importlib.util, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.environ.get("SITE_BASE", "https://migamiga.berlin").rstrip("/")
LANGS = ["de", "en", "es", "it"]  # first = default (x-default)
LOCALE = {"de": "de_DE", "en": "en_GB", "es": "es_ES", "it": "it_IT"}
# source file -> (output file, public slug per language)
PAGES = {
    "home": ("index.html", {"de": "", "en": "", "es": "", "it": ""}),
    "about": ("about.html", {"de": "ueber-uns", "en": "about", "es": "nosotros", "it": "chi-siamo"}),
    "faq": ("faq.html", {l: "faq" for l in LANGS}),
    "404": ("404.html", None),
}
INDEXED = ("home", "about", "faq")
KEEP = re.compile(r"^(?:[\W\d_]*|#\w+|Berlin|[\w.+-]+@[\w.-]+|MIGAMIGA|@migamiga\.de|https?://.*|img/.*|[a-z]{2}_[A-Z]{2}|Deutsch|English|Español|Italiano|DE|EN|ES|IT|El Jard.n|La Berlinesa|La Cl.sica|Tiramig.|Las Bravas Verdes|"
                  r"Instagram|WhatsApp|Email|FAQ|Lorem ipsum.*|Consectetur numquam.*|eligendi rem.*|\+49 155 65933378|"
                  r"Emma Newman|Paul Trueman|Viktoria Freeman|Audrey Oldman|Webdesign Berlin|webdesign berlin|"
                  r"icon|food|phones|man|burger|Guest|instagram|width=.*|ie=edge|index, follow.*|noindex, follow|website|summary_large_image)$", re.S)
missing = {}


I18N = os.path.join(ROOT, "scripts/i18n")


def read(name):
    p = os.path.join(I18N, name)
    if not os.path.exists(p):
        return {}
    return dict(l.rstrip("\n").split("|", 1) for l in open(p, encoding="utf-8") if "|" in l)


def load(lang):
    """en.txt: id|english (append-only, ids stay stable). <lang>.txt: id|translation."""
    if lang == "en":
        return {}
    en, t = read("en.txt"), read(lang + ".txt")
    return {en[i]: v for i, v in t.items() if i in en}


def norm(s):
    return " ".join(html.unescape(s).split())


def url(lang, page):
    slug = PAGES[page][1][lang]
    return f"{BASE}/{lang}/{slug}".rstrip("/") + ("/" if not slug else "")


def tr(T, lang, s, page):
    k = norm(s)
    if lang == "en" or not k or KEEP.match(k):
        return None
    if k in T:
        return T[k]
    missing.setdefault(lang, {}).setdefault(k, page)
    return None


JSON_KEYS = {"name", "description", "text", "headline", "serviceType"}


def walk(T, lang, o, page, key=None):
    if isinstance(o, dict):
        return {k: walk(T, lang, v, page, k) for k, v in o.items()}
    if isinstance(o, list):
        return [walk(T, lang, v, page, key) for v in o]
    if isinstance(o, str):
        if PAGES[page][1] and o == url("en", page):
            return url(lang, page)
        if key in JSON_KEYS:
            return tr(T, lang, o, page) or o
    return o


def build(lang, T, page, src):
    out_name, slugs = PAGES[page]
    s = src
    parts = re.split(r"(<script.*?</script>|<style.*?</style>|<!--.*?-->)", s, flags=re.S)
    for i, p in enumerate(parts):
        if p.startswith("<script") and "ld+json" in p[:80]:
            m = re.match(r"(<script[^>]*>)(.*)(</script>)", p, re.S)
            data = walk(T, lang, json.loads(m.group(2)), page)
            txt = json.dumps(data, ensure_ascii=False, indent=2)
            txt = txt.replace('"en", "de", "es"', '"de", "en", "es", "it"')
            parts[i] = m.group(1) + "\n" + txt + "\n  " + m.group(3)
            continue
        if p.startswith(("<script", "<style", "<!--")):
            continue

        def text(m):
            t = tr(T, lang, m.group(2), page)
            if t is None:
                return m.group(0)
            return m.group(1) + html.escape(t, quote=False) + m.group(3)

        def attr(m):
            t = tr(T, lang, m.group(3), page)
            if t is None:
                return m.group(0)
            return m.group(1) + m.group(2) + html.escape(t, quote=True) + '"'

        p = re.sub(r"(>\s*)([^<>]*[^<>\s][^<>]*?)(\s*<)", text, p)
        p = re.sub(r'(\b(?:alt|aria-label|title|placeholder|content)=)(")([^"]*)"', attr, p)
        parts[i] = p
    s = "".join(parts)
    s = s.replace('<html lang="en">', f'<html lang="{lang}">')
    # title lives in <title>…</title> which the text pass already covered
    s = re.sub(r'(["(])(img|css|js|fonts)/', r"\1../\2/", s)
    s = s.replace('href="home.html"', 'href="index.html"')
    # head: canonical / alternates / og locale / og:url
    if slugs:
        s = re.sub(r'\s*<link rel="(?:canonical|alternate)"[^>]*>', "", s)
        s = re.sub(r'\s*<meta property="og:(?:locale(?::alternate)?|url)"[^>]*>', "", s)
        alts = "".join(f'\n  <link rel="alternate" hreflang="{l}" href="{url(l, page)}">' for l in LANGS)
        head = (f'\n  <link rel="canonical" href="{url(lang, page)}">' + alts +
                f'\n  <link rel="alternate" hreflang="x-default" href="{url(LANGS[0], page)}">')
        og = (f'\n  <meta property="og:locale" content="{LOCALE[lang]}">' +
              "".join(f'\n  <meta property="og:locale:alternate" content="{LOCALE[l]}">' for l in LANGS if l != lang) +
              f'\n  <meta property="og:url" content="{url(lang, page)}">')
        s = s.replace('<meta property="og:type"', head.lstrip() + '\n  <meta property="og:type"', 1)
        s = s.replace('<meta property="og:site_name" content="MIGAMIGA">', '<meta property="og:site_name" content="MIGAMIGA">' + og, 1)
    # language switcher
    names = {"de": ("🇩🇪", "Deutsch"), "en": ("🇬🇧", "English"), "es": ("🇪🇸", "Español"), "it": ("🇮🇹", "Italiano")}
    items = ""
    for l in LANGS:
        cur = ' class="sb-active" aria-current="true"' if l == lang else ""
        items += (f'\n                  <li><a href="../{l}/{out_name}" hreflang="{l}" lang="{l}" data-no-swup data-lang="{l}"{cur}>'
                  f'<span class="sb-flag" aria-hidden="true">{names[l][0]}</span>{names[l][1]}<span class="sb-code">{l.upper()}</span></a></li>')
    s = re.sub(r'(<ul class="sb-lang-menu">).*?(\n\s*</ul>)', lambda m: m.group(1) + items + m.group(2), s, flags=re.S)
    s = re.sub(r'(<span class="sb-lang-current">)[A-Z]+', lambda m: m.group(1) + lang.upper(), s)
    return s


def sitemap():
    import datetime
    today = datetime.date.today().isoformat()
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page in INDEXED:
        for lang in LANGS:
            home = page == "home"
            out += ["  <url>", f"    <loc>{url(lang, page)}</loc>", f"    <lastmod>{today}</lastmod>",
                    f"    <changefreq>{'weekly' if home else 'monthly'}</changefreq>",
                    f"    <priority>{'1.0' if home else '0.7'}</priority>"]
            out += [f'    <xhtml:link rel="alternate" hreflang="{l}" href="{url(l, page)}"/>' for l in LANGS]
            out += [f'    <xhtml:link rel="alternate" hreflang="x-default" href="{url(LANGS[0], page)}"/>', "  </url>"]
    out.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(out) + "\n")


def main():
    sitemap()
    for lang in LANGS:
        T = load(lang)
        os.makedirs(os.path.join(ROOT, lang), exist_ok=True)
        for page, (out_name, _) in PAGES.items():
            src = open(os.path.join(ROOT, page + ".html"), encoding="utf-8").read()
            with open(os.path.join(ROOT, lang, out_name), "w", encoding="utf-8") as f:
                f.write(build(lang, T, page, src))
    if "--dump" in sys.argv:  # append new English strings to en.txt with fresh ids
        en = read("en.txt")
        known = set(en.values())
        n = max(map(int, en), default=0)
        with open(os.path.join(I18N, "en.txt"), "a", encoding="utf-8") as f:
            for k in dict.fromkeys(k for d in missing.values() for k in d):
                if k not in known:
                    n += 1
                    f.write(f"{n}|{k}\n")
    for lang, d in missing.items():
        print(f"[{lang}] {len(d)} missing")
        if "-v" in sys.argv:
            for k, p in d.items():
                print(f"  {p}: {k}")


main()

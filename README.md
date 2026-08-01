# migamiga

Static multilingual landing (DE / EN / ES) for migamiga, a Berlin lunchbox sandwich delivery service.

## Stack

Plain HTML + one shared CSS + vanilla JS. **No build, no bundler, no framework, no `npm install`.** Deployed to Cloudflare Pages with extensionless URLs.

## Local dev

Clean URLs need a server that resolves extensionless (`/impressum`, not `/impressum.html`):

```bash
npx serve
```

Then open `http://localhost:3000/`.

`python3 -m http.server` also works but only for pages that end in `/` (directory indexes); it won't resolve `/impressum` without the `.html`.

## Editing

- **Change visible text:** edit each `<lang>/index.html` (3 files). German is the source of truth.
- **Change styles:** edit `styles/site.css`, then run `python3 scripts/tools/inline-css.py` to re-inline into every HTML.
- **Change nav/footer behavior:** edit `scripts/nav.js` or `scripts/footer.<lang>.js`, then bump the `?v=N` query param on every `<script src="/scripts/...?v=N">` reference.

## Deployment

Push to the branch configured in Cloudflare Pages. See `CLAUDE.md` for full detail.

# Agent Instructions

This repository contains the public marketing website for PalmAura.

## Scope

- Work only on the marketing website in this repo.
- Do not modify the iOS app/backend repo (`psyduckler/palmaura`) unless explicitly instructed.
- Keep the site static and Cloudflare Pages-friendly unless a framework migration is explicitly approved.

## Commands

```bash
npm run smoke:local
npm run deploy
```

Use `npm run smoke:local` for local preview. Do not run `npm run deploy` unless Bernard explicitly asks for a production deploy.

## Source of truth

- Homepage: `public/index.html`
- Styles: `public/styles.css`
- Privacy: `public/privacy.html`
- Terms: `public/terms.html`
- Blog content (source): `content/blog/*.md`
- Blog output (generated, committed): `public/blog/*.html`
- Blog templates: `templates/blog-article.html`, `templates/blog-index.html`
- Blog build script: `tools/build-blog.mjs`
- SEO/discovery: `public/robots.txt`, `public/sitemap.xml`, page metadata in HTML heads

## Blog workflow

Articles are authored as markdown in `content/blog/`. The build script generates the corresponding HTML, the blog index, and the sitemap. Both the markdown source and the generated HTML are committed.

```bash
npm install                  # first time only
# edit or add content/blog/your-article.md
npm run build:blog           # regenerates public/blog/*.html + sitemap.xml
git add content/blog public/blog public/sitemap.xml
```

See `content/blog/_README.md` for the frontmatter schema and authoring conventions.

## Product direction

PalmAura is an iOS palm reading app. Marketing copy should be clear that readings are symbolic/reflective/entertainment-oriented, not medical, legal, financial, or psychological advice.

Optimize changes for:

1. App Store / early-access conversion
2. Trust and privacy clarity
3. Mobile-first presentation
4. Fast load time
5. Clean, premium visual polish

## Change rules

- Preserve `/privacy.html` and `/terms.html` routes.
- Keep canonical URLs on `https://palmaura.app/`.
- Update sitemap and metadata when adding/removing public pages.
- Avoid introducing dependencies or build steps without a clear reason.
- Do not commit generated/local files such as `.wrangler/`, `node_modules/`, `.DS_Store`, screenshots, or local QA artifacts.
- Before handoff, report what changed and how it was locally checked.

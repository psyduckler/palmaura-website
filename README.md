# PalmAura Website

Marketing website for [PalmAura](https://palmaura.app/), the iOS palm reading app.

This repo is intentionally separate from the iOS app/backend repo at [`psyduckler/palmaura`](https://github.com/psyduckler/palmaura) so marketing-site work can move quickly without touching app code.

## Production

- Site: https://palmaura.app/
- Cloudflare Pages project: `palmaura`
- Source directory: `public/`

## Local preview

```bash
npm run smoke:local
```

Then open:

```txt
http://localhost:8788/
```

## Deploy

Manual deploy via Cloudflare Wrangler:

```bash
npm run deploy
```

Do not deploy without explicit approval if you are acting as an external/agent contributor.

## Files

```txt
public/index.html         Homepage
public/styles.css         Global styles
public/privacy.html       Privacy policy
public/terms.html         Terms of service
public/blog/index.html    Blog index (generated)
public/blog/*.html        Blog articles (generated)
public/robots.txt         Robots directives
public/sitemap.xml        Sitemap (generated)
public/og.svg             Open Graph image
public/favicon.svg        Favicon
content/blog/*.md         Blog article sources
templates/blog-*.html     Blog templates
tools/build-blog.mjs      Blog build script
```

## Blog

Articles are written as markdown in `content/blog/` and rendered to static HTML by `npm run build:blog`. Both source and output are committed.

```bash
npm install              # first time only
npm run build:blog       # build content/blog/*.md → public/blog/*.html + sitemap
```

See `content/blog/_README.md` for the frontmatter schema.

## Contribution guidelines

- Keep the site static and lightweight unless a migration is explicitly requested.
- Preserve `/privacy.html` and `/terms.html` routes.
- If adding/removing routes, update `public/sitemap.xml`, metadata, and any relevant nav links.
- Optimize for App Store conversion, trust, clarity, and mobile-first readability.
- Avoid touching the iOS app/backend repo for marketing-site changes.

# Blog content authoring

Articles live as markdown files in this directory. The filename doesn't matter — the `slug` in frontmatter determines the URL.

## Workflow

```bash
npm install                  # first time only
# create or edit content/blog/your-article.md
npm run build:blog           # regenerates public/blog/*.html + sitemap.xml
# commit BOTH the markdown source AND the generated HTML
```

Generated HTML is committed alongside the markdown source so Cloudflare Pages can serve the static site without running a build step, and so reviewers can see the final output in PRs.

## Required frontmatter

```yaml
---
title: "What does a forked heart line mean?"
slug: "forked-heart-line-meaning"
description: "Plain-English meta description, 150–160 chars."
keyword: "forked heart line meaning"
date_published: "2026-05-16"
bluf: "The 50–60 word answer LLMs and Google AI Overview will scrape. Lead with the definitive answer; details follow in the body."
---
```

## Optional frontmatter

```yaml
date_modified: "2026-05-17"          # defaults to date_published
reviewer: "PalmAura Editorial Team"  # optional; defaults to PalmAura Editorial Team
faqs:
  - q: "Is a forked heart line rare?"
    a: "No — end-forks are common. Mid-line forks are less common but not rare."
  - q: "Does it matter which hand?"
    a: "Yes. Most modern palmists read both: the dominant hand for current state, the non-dominant for tendencies."
```

## Visual placeholders

Inline `<aside class="visual-placeholder">` blocks mark where a custom illustration should go. Use them inline in the markdown:

```html
<aside class="visual-placeholder">VISUAL: A Victorian-style hand diagram showing the heart line forking into two distinct branches at the end.</aside>
```

These are authoring notes only. `tools/build-blog.mjs` strips `visual-placeholder` blocks from generated public HTML until real illustrations are available, so they do not appear on production pages.

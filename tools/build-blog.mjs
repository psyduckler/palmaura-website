#!/usr/bin/env node
// Build PalmAura blog: content/blog/*.md → public/blog/*.html + index + sitemap.
// Pure static output; Cloudflare Pages serves the generated files directly.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content/blog');
const OUTPUT_DIR = join(ROOT, 'public/blog');
const TEMPLATE_DIR = join(ROOT, 'templates');
const SITE_URL = 'https://palmaura.app';

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })
  .use(anchor, { permalink: anchor.permalink.headerLink({ safariReaderFix: true }) });

const REQUIRED_FRONTMATTER = ['title', 'slug', 'description', 'keyword', 'bluf', 'date_published'];

function readTemplate(name) {
  return readFileSync(join(TEMPLATE_DIR, name), 'utf8');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
}

function renderArticle(filePath, template) {
  const raw = readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  for (const k of REQUIRED_FRONTMATTER) {
    if (!data[k]) throw new Error(`Missing frontmatter "${k}" in ${filePath}`);
  }

  const dateModified = data.date_modified || data.date_published;
  const reviewer = data.reviewer || 'PalmAura Editorial Team';
  const contentForRender = content.replace(/<aside class="visual-placeholder">[\s\S]*?<\/aside>?/g, '');
  const contentHtml = md.render(contentForRender);

  let faqHtml = '';
  let faqJsonLdScript = '';
  if (Array.isArray(data.faqs) && data.faqs.length) {
    const items = data.faqs.map(({ q, a }) =>
      `  <dt>${escapeHtml(q)}</dt>\n  <dd>${md.renderInline(a)}</dd>`).join('\n');
    faqHtml = `<section class="blog-faq" aria-labelledby="faq-heading">\n<h2 id="faq-heading">Common questions</h2>\n<dl>\n${items}\n</dl>\n</section>\n`;

    const faqJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      }))
    });
    faqJsonLdScript = `<script type="application/ld+json">${faqJsonLd}</script>`;
  }

  const articleJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    datePublished: data.date_published,
    dateModified: dateModified,
    author: { '@type': 'Organization', name: 'The PalmAura Team', url: SITE_URL },
    reviewedBy: { '@type': 'Person', name: reviewer },
    publisher: { '@type': 'Organization', name: 'PalmAura', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${data.slug}.html`
  });

  const replacements = {
    TITLE: escapeHtml(data.title),
    DESCRIPTION: escapeHtml(data.description),
    SLUG: data.slug,
    KEYWORD: escapeHtml(data.keyword),
    BLUF: md.renderInline(data.bluf),
    REVIEWER: escapeHtml(reviewer),
    DATE_PUBLISHED: data.date_published,
    DATE_MODIFIED: dateModified,
    DATE_DISPLAY: formatDate(dateModified),
    CONTENT_HTML: contentHtml,
    FAQ_HTML: faqHtml,
    ARTICLE_JSONLD: articleJsonLd,
    FAQ_JSONLD_SCRIPT: faqJsonLdScript
  };

  let output = template;
  for (const [k, v] of Object.entries(replacements)) {
    output = output.split(`{{${k}}}`).join(v);
  }
  return { html: output, data: { ...data, date_modified: dateModified } };
}

function renderIndex(articles, template) {
  const items = articles
    .slice()
    .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
    .map(a => `
      <li class="blog-index-item">
        <a href="/blog/${a.slug}.html">
          <h2>${escapeHtml(a.title)}</h2>
          <p>${escapeHtml(a.description)}</p>
          <time datetime="${a.date_published}">${formatDate(a.date_published)}</time>
        </a>
      </li>`).join('');
  return template.split('{{ARTICLES}}').join(items);
}

function updateSitemap(articles) {
  const sitemapPath = join(ROOT, 'public/sitemap.xml');
  const baseUrls = [
    `<url><loc>${SITE_URL}/</loc></url>`,
    `<url><loc>${SITE_URL}/privacy.html</loc></url>`,
    `<url><loc>${SITE_URL}/terms.html</loc></url>`,
    `<url><loc>${SITE_URL}/blog/</loc></url>`
  ];
  const articleUrls = articles
    .slice()
    .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
    .map(a => `<url><loc>${SITE_URL}/blog/${a.slug}.html</loc><lastmod>${a.date_modified}</lastmod></url>`);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...baseUrls, ...articleUrls].join('\n  ')}
</urlset>
`;
  writeFileSync(sitemapPath, sitemap);
}

function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!existsSync(CONTENT_DIR)) mkdirSync(CONTENT_DIR, { recursive: true });

  const articleTemplate = readTemplate('blog-article.html');
  const indexTemplate = readTemplate('blog-index.html');

  const articles = [];
  const files = readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  for (const file of files) {
    const filePath = join(CONTENT_DIR, file);
    const { html, data } = renderArticle(filePath, articleTemplate);
    writeFileSync(join(OUTPUT_DIR, `${data.slug}.html`), html);
    articles.push(data);
    console.log(`  built  /blog/${data.slug}.html`);
  }

  writeFileSync(join(OUTPUT_DIR, 'index.html'), renderIndex(articles, indexTemplate));
  console.log(`  built  /blog/index.html  (${articles.length} article${articles.length === 1 ? '' : 's'})`);

  updateSitemap(articles);
  console.log('  wrote  /sitemap.xml');
}

main();

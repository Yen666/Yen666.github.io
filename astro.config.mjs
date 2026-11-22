// WHY these settings:
// - site/base: a GitHub Pages USER site (Yen666/Yen666.github.io) is served from the domain root, so base is '/'.
//   If this ever becomes a project site, change `base`; every link keeps working because all internal
//   links go through withBase() in src/lib/url.ts.
// - trailingSlash 'always' keeps URLs identical between dev and the static host.
// - KaTeX: remark-math parses $..$ / $$..$$, rehype-katex renders to HTML (CSS imported in BaseLayout).
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://Yen666.github.io',
  base: '/',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-Hant' } },
    }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },
});

# Yen-Wei Chang · personal academic website

Source for https://Yen666.github.io — a bilingual (English `/`, 繁體中文 `/zh/`) Astro static site.

```bash
npm install
npm run dev      # local preview
npm run build    # build to dist/
npm run check    # validate content, links, bilingual drift
```

- Spec: [`SPEC.md`](SPEC.md) · Editing guide (humans and AI agents): [`AGENT.md`](AGENT.md)
- Content: `src/data/*.json`, `src/content/notes/*.md`
- Deploy: GitHub Actions → GitHub Pages (Settings > Pages > Source: **GitHub Actions**)
- `legacy/` holds the old 2023 template site (not deployed).

Remaining placeholders: `grep -rn "TODO:" src public`.

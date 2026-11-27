# AGENT.md — instructions for AI agents editing this site

Personal academic site of 張彥崴 / Yen-Wei Chang. Astro static site → GitHub Pages user site (base `/`). See `SPEC.md` for scope.

## Commands
- `npm run dev` — local dev server
- `npm run build` — static build to `dist/`
- `npm run check` — validation (schemas, duplicate ids, dead links in `dist/`, en/zh drift, hard-coded colors). **Run `build` then `check` before every commit.** Exit code 1 = errors; WARN lines are informational.

## Where things live
| What | File |
|---|---|
| Profile, bio, links, email (split user/domain) | `src/data/profile.json` |
| Publications (hand-typed) | `src/data/publications.json` |
| News (also feeds RSS) | `src/data/news.json` |
| Open-source contributions | `src/data/opensource.json` |
| CV | `src/data/cv.json` |
| UI strings (en + zh) | `src/data/ui.json` |
| Notes (Markdown + KaTeX) | `src/content/notes/<slug>.<lang>.md` |
| Schemas (single source of truth) | `src/schemas.mjs` |
| Design tokens (only place for colors) | `src/styles/global.css` |
| Page content/layout | `src/views/*.astro` (shared by `/` and `/zh/` routes in `src/pages/`) |

## Hard rules
1. **Never invent facts** — publications, awards, affiliations, collaborators, dates. Unknown = leave it out (empty array, `null`, or omit the entry). **Never commit placeholder/"TODO"/sample content: visitors must see only real content.** Do not add real-looking entries without the owner supplying them.
1a. **Empty data hides itself automatically.** Empty `publications.json` / `news.json` / `opensource.json`, no notes, or a CV with no items → the section disappears from Home and the nav link is not rendered (the route still builds, so keep it routable). Contact buttons show only for links that are set (`github`, `linkedin`, `scholar`, `email`; CV button needs `cvPdf` or CV items). `headshot: null` hides the photo. Bio paragraphs starting with `TODO` are never shown. Just add real data to make things appear; no code change needed. The RSS feed stays valid when empty. Helpers: `has.*` in `src/lib/data.ts`, `hasNotes()` in `src/lib/notes.ts`.
2. **No hard-coded content in components**; content comes from `src/data` / `src/content`.
3. **Every internal URL goes through `withBase()` / `localePath()`** (`src/lib/url.ts`).
4. **Bilingual:** `/` = English, `/zh/` = Traditional Chinese, same routes. Do NOT machine-translate personal content. Missing translation: set the `zh` field to `null` (or omit the zh note file); `/zh/` falls back to the English text with a small "English only" mark. Note ids are `lang/slug` from frontmatter, not file paths.
5. **Colors only via CSS variables** in `global.css`; no hex in components (check enforces it). One accent color.
6. **Schemas:** change `src/schemas.mjs` when changing data shape; keep data valid.
7. Text-only look, no animation, no analytics/comments/search (modules are OFF per SPEC).
8. `legacy/` is the old site; not deployed — don't edit or link to it.

## Recipes
- **Add a publication:** append to `publications.json` (unique kebab-case `id`; `selected: true` to show on Home; `links.pdf/arxiv/code` full URLs). Put your own name exactly as in `profile.selfNames` so it is highlighted.- **Add an open-source contribution (e.g. vLLM PR):** in `opensource.json` add/modify a project and push `{ "title", "url", "status": "merged|open|closed", "date": "YYYY-MM-DD" }` into `contributions`.
- **Add news:** append to `news.json`: `{ id, date, text: {en, zh|null} }`.
- **Add a note:** create `src/content/notes/<slug>.en.md` with frontmatter `title, slug, lang, date, summary`. A zh version is `<slug>.zh.md` with the same `slug` and `date`. Math: `$...$`, `$$...$$`.
- **Set email:** `profile.json` `"email": {"user": "...", "domain": "..."}` (never write the full address anywhere).
- **CV PDF:** put file at `public/cv.pdf`, set `"cvPdf": "cv.pdf"`.
- **Headshot:** put image under `public/images/`, update `headshot`, and update the alt text in `ui.json` (`headshotAlt`).
- **OG image:** replace `public/og-default.png` (1200×630).

## Deployment
Push to `main` → `.github/workflows/deploy.yml` builds, checks and deploys. Pages source must be "GitHub Actions". Work on branches and open PRs.

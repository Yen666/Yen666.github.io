# Site spec (Phase 0 answers, one page)

Owner: 張彥崴 / Yen-Wei Chang (TODO: confirm romanization — `profile.json` `romanization` + `selfNames`).
Role: Undergraduate, Department of Computer Science and Information Engineering, National Taiwan University (NTU CSIE).
Research interests: multimodal LLMs, computer vision, diffusion models, AI security.
GitHub: https://github.com/Yen666. Everything else (email, LinkedIn, Scholar, CV PDF, photo, bio details) is `TODO:`.

**Purposes (ranked):** academic profile > research portfolio > notes/blog.

**Languages:** English default at `/`; Traditional Chinese mirror at `/zh/`. No machine translation of personal content; missing translations are `null` in data / missing files, and the UI says so ("English only" tags, notice text).

**Deploy:** GitHub Pages user site, base path `/`, GitHub Actions (`.github/workflows/deploy.yml`). Repo Settings > Pages > Source must be "GitHub Actions".

**Old site:** the 2023 HTML-template site was moved to `legacy/` (not deployed, not deleted).

**Content rules:** publications typed by hand; only clearly marked TODO sample entries exist. Nothing (publications, awards, affiliations, collaborators) is invented. Placeholders: headshot, favicon, OG image.

**Look:** minimal-academic (reference: shihhsinwang0214.github.io/personal_website). One accent color; light + dark with toggle (stored, OS default); serif headings, sans body, CJK font stack; narrow measure (42rem); plain-list publications; top nav; text-only, no animation.

**Modules ON:** publications (grouped by year; venue, authors with self highlighted, pdf/arxiv/code links; "selected" subset on home) · news feed + RSS (`/rss.xml`, `/zh/rss.xml`) · CV page (rendered + PDF link placeholder) · notes/blog with KaTeX · Open Source page (contribution list, ready for vLLM PRs) · contact links with obfuscated email · sitemap + OG/Twitter cards.

**Modules OFF:** teaching, lab handbook, search, comments, analytics, demos.

**Editors:** the owner and AI agents → zod schemas (`src/schemas.mjs`), `npm run check`, `AGENT.md`.

**Stack:** Astro (static), plain CSS tokens, JSON data in `src/data/`, Markdown notes in `src/content/notes/`.

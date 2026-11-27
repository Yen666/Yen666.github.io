// `npm run check` — content + site validation. Exit code 1 on any ERROR; WARNINGs are informational.
// Run `npm run build` first so the built-output link check can run (it is an ERROR if dist/ is missing in CI mode: CI=true).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { z } from 'zod';
import { makeSchemas } from '../src/schemas.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : [p];
      });

const s = makeSchemas(z);

// 1. Data files against zod schemas ----------------------------------------------------------
const parse = (label, schema, file) => {
  const r = schema.safeParse(readJson(file));
  if (!r.success) {
    for (const i of r.error.issues) err(`${file}: ${i.path.join('.')} — ${i.message}`);
    return null;
  }
  return r.data;
};
const profile = parse('profile', s.profile, 'src/data/profile.json');
const pubs = parse('pubs', z.array(s.publication), 'src/data/publications.json') ?? [];
const news = parse('news', z.array(s.newsItem), 'src/data/news.json') ?? [];
const oss = parse('oss', z.array(s.openSource), 'src/data/opensource.json') ?? [];
const cv = parse('cv', s.cv, 'src/data/cv.json');

// 2. Duplicate ids ----------------------------------------------------------------------------
const dupes = (label, ids) => {
  const seen = new Set();
  for (const id of ids) (seen.has(id) ? err(`duplicate ${label} id: ${id}`) : seen.add(id));
};
dupes('publication', pubs.map((p) => p.id));
dupes('news', news.map((n) => n.id));
dupes('open-source', oss.map((o) => o.id));
if (cv) dupes('cv section', cv.sections.map((x) => x.id));

// 3. Notes frontmatter, ids, language pairs ----------------------------------------------------
const noteFiles = walk(join(root, 'src/content/notes')).filter((f) => extname(f) === '.md');
const notes = [];
for (const f of noteFiles) {
  const rel = relative(root, f);
  const { data } = matter(readFileSync(f, 'utf8'));
  const r = s.note.safeParse(data);
  if (!r.success) {
    for (const i of r.error.issues) err(`${rel}: frontmatter ${i.path.join('.')} — ${i.message}`);
    continue;
  }
  notes.push({ ...r.data, rel });
}
dupes('note (lang/slug)', notes.map((n) => `${n.lang}/${n.slug}`));
const bySlug = new Map();
for (const n of notes) bySlug.set(n.slug, [...(bySlug.get(n.slug) ?? []), n]);
for (const [slug, group] of bySlug) {
  const en = group.find((n) => n.lang === 'en');
  const zh = group.find((n) => n.lang === 'zh');
  if (!en) err(`note "${slug}": has a zh version but no English original`);
  else if (!zh) warn(`note "${slug}": no zh translation (site marks it "English only")`);
  else if (en.date.valueOf() !== zh.date.valueOf()) err(`note "${slug}": en/zh dates differ (language-pair drift)`);
}

// 4. Bilingual completeness (informational; missing zh is shown honestly on the site) ----------
const missingZh = [];
const scan = (label, v) => {
  if (v && typeof v === 'object') {
    if ('en' in v && 'zh' in v && Object.keys(v).length === 2) {
      if (v.en && !v.zh) missingZh.push(label);
      if (v.zh && !v.en) err(`${label}: zh present but en missing`);
    } else for (const [k, x] of Object.entries(v)) scan(`${label}.${k}`, x);
  }
};
scan('profile', profile);
scan('news', news);
scan('opensource', oss);
scan('cv', cv);
if (missingZh.length) warn(`${missingZh.length} bilingual fields have no zh translation yet`);

// 5. No hard-coded colors outside global.css (design tokens only) ------------------------------
const hexRe = /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/;
for (const dir of ['src/components', 'src/layouts', 'src/views', 'src/pages']) {
  for (const f of walk(join(root, dir))) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (hexRe.test(line)) err(`${relative(root, f)}:${i + 1}: raw hex color; use a CSS token from src/styles/global.css`);
    });
  }
}

// 6. Dead internal links / assets in the built output ------------------------------------------
const dist = join(root, 'dist');
if (!existsSync(dist)) {
  (process.env.CI ? err : warn)('dist/ not found: run `npm run build` first; link check skipped');
} else {
  const exists = (p) => existsSync(p) && statSync(p).isFile();
  const resolveTarget = (urlPath) => {
    const p = join(dist, decodeURIComponent(urlPath));
    if (exists(p)) return true;
    if (exists(join(p, 'index.html'))) return true;
    return false;
  };
  for (const f of walk(dist).filter((x) => x.endsWith('.html'))) {
    const html = readFileSync(f, 'utf8');
    const rel = relative(dist, f);
    const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
      if (!ref.startsWith('/')) { err(`${rel}: relative link "${ref}" (use withBase)`); continue; }
      const clean = ref.split('#')[0].split('?')[0];
      if (!clean) continue;
      if (!resolveTarget(clean)) err(`${rel}: dead internal link ${ref}`);
    }
  }
  // twin pages exist for both languages
  for (const p of ['', 'publications', 'news', 'open-source', 'cv', 'notes']) {
    for (const base of ['', 'zh/']) {
      if (!resolveTarget(`/${base}${p}`)) err(`missing built page /${base}${p}`);
    }
  }
}

// 7. Report TODO placeholders --------------------------------------------------------------------
const todoFiles = [...walk(join(root, 'src')), ...walk(join(root, 'public'))].filter((f) => /\.(json|md|astro|ts|svg)$/.test(f));
let todoCount = 0;
for (const f of todoFiles) {
  const n = (readFileSync(f, 'utf8').match(/TODO:/g) ?? []).length;
  if (n && !f.endsWith('ui.json')) todoCount += n;
}
if (todoCount) warn(`${todoCount} "TODO:" placeholders remain in src/ and public/ (run: grep -rn "TODO:" src public)`);

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(`\ncheck: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);

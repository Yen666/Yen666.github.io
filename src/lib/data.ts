import { z } from 'zod';
import { makeSchemas } from '../schemas.mjs';
import profileRaw from '../data/profile.json';
import publicationsRaw from '../data/publications.json';
import newsRaw from '../data/news.json';
import openSourceRaw from '../data/opensource.json';
import cvRaw from '../data/cv.json';
import uiRaw from '../data/ui.json';
import type { Lang } from './url';

const s = makeSchemas(z);

// Parsing at import time makes `astro build` fail loudly on malformed data.
export const profile = s.profile.parse(profileRaw);
export const publications = z.array(s.publication).parse(publicationsRaw);
export const news = z.array(s.newsItem).parse(newsRaw);
export const openSource = z.array(s.openSource).parse(openSourceRaw);
export const cv = s.cv.parse(cvRaw);
export const ui = uiRaw;

export type Bi = { en: string | null; zh: string | null };

export function t(lang: Lang) {
  return ui[lang];
}

/** Picks the requested language; if missing falls back to English and reports `missing: true`. */
export function pick(b: Bi, lang: Lang): { text: string; missing: boolean } {
  const v = b[lang];
  if (v) return { text: v, missing: false };
  return { text: b.en ?? '', missing: lang !== 'en' };
}

export function sortedNews() {
  return [...news].sort((a, b) => b.date.localeCompare(a.date));
}

export function publicationsByYear() {
  const years = new Map<number, typeof publications>();
  for (const p of [...publications].sort((a, b) => b.year - a.year)) {
    years.set(p.year, [...(years.get(p.year) ?? []), p]);
  }
  return [...years.entries()];
}

// Every internal link/asset URL MUST go through withBase() (or localePath(), which uses it).
// WHY: base-path bugs only show up in production when the site moves under a sub-path.
export type Lang = 'en' | 'zh';

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Locale-aware internal path. English lives at `/`, Traditional Chinese at `/zh/`. */
export function localePath(lang: Lang, path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return withBase(lang === 'zh' ? `/zh${p}` : p);
}

/** Path of the other-language twin of a page given its locale-less path. */
export function altLang(lang: Lang): Lang {
  return lang === 'en' ? 'zh' : 'en';
}

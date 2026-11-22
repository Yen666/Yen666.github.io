import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './url';

export type Note = CollectionEntry<'notes'>;

export async function allNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', (n) => !n.data.draft);
  return notes.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** For a language list: use the translation if it exists, else the English entry flagged `fallback`. */
export async function notesForLang(lang: Lang): Promise<{ note: Note; fallback: boolean }[]> {
  const notes = await allNotes();
  const slugs = [...new Set(notes.map((n) => n.data.slug))];
  const out: { note: Note; fallback: boolean }[] = [];
  for (const slug of slugs) {
    const own = notes.find((n) => n.data.slug === slug && n.data.lang === lang);
    const en = notes.find((n) => n.data.slug === slug && n.data.lang === 'en');
    if (own) out.push({ note: own, fallback: false });
    else if (en) out.push({ note: en, fallback: true });
  }
  return out.sort((a, b) => b.note.data.date.valueOf() - a.note.data.date.valueOf());
}

export const noteTwin = async (note: Note, lang: Lang) =>
  (await allNotes()).find((n) => n.data.slug === note.data.slug && n.data.lang === lang);

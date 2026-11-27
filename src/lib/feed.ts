import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { news, pick, t } from './data';
import { notesForLang } from './notes';
import { localePath, type Lang } from './url';

/** One feed per language containing news items and notes. Untranslated items are tagged as English. */
export async function feedResponse(context: APIContext, lang: Lang) {
  const ui = t(lang);
  const notes = await notesForLang(lang);
  const items = [
    ...news.map((n) => {
      const { text, missing } = pick(n.text, lang);
      return {
        title: missing ? `[EN] ${text}` : text,
        pubDate: new Date(n.date),
        link: n.link ?? localePath(lang, '/news/'),
      };
    }),
    ...notes.map(({ note, fallback }) => ({
      title: fallback ? `[EN] ${note.data.title}` : note.data.title,
      description: note.data.summary,
      pubDate: note.data.date,
      link: localePath(fallback ? 'en' : lang, `/notes/${note.data.slug}/`),
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: ui.siteTitle,
    description: ui.feedDescription,
    site: context.site!,
    items,
    customData: `<language>${lang === 'zh' ? 'zh-Hant' : 'en'}</language>`,
  });
}

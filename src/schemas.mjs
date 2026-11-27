// Single source of truth for content shapes. Used by:
//  - scripts/check-content.mjs (plain zod)
//  - src/content.config.ts (Astro's z, passed in via the make* factories)
//  - src/lib/data.ts (parses JSON data at build time)
// Convention: every user-facing string is bilingual {en, zh}. A missing translation is `null`
// (rendered as an honest "translation not available" notice) — never machine-translated.
// Unknown facts: leave null/empty or omit the entry; empty data hides the section on the site.

export const makeSchemas = (z) => {
  const bi = z.object({ en: z.string().nullable(), zh: z.string().nullable() });
  const url = z.string().url();

  const profile = z.object({
    name: bi, // display name
    romanization: z.string(), // e.g. "Yen-Wei Chang"
    selfNames: z.array(z.string()).min(1), // names matched to highlight yourself in author lists
    role: bi,
    affiliation: bi,
    interests: z.array(bi),
    bio: z.array(bi), // paragraphs
    github: url,
    linkedin: url.nullable(),
    scholar: url.nullable(),
    email: z.object({ user: z.string(), domain: z.string() }).nullable(), // obfuscated at render time
    cvPdf: z.string().nullable(), // path under public/, e.g. "cv.pdf"; null = not yet available
    headshot: z.string().nullable(), // path under public/; null = no photo (image hidden)
  });

  const publication = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    authors: z.array(z.string()).min(1),
    venue: z.string(),
    year: z.number().int(),
    type: z.enum(['conference', 'journal', 'preprint', 'workshop', 'thesis', 'other']),
    selected: z.boolean().default(false),
    links: z
      .object({ pdf: url.optional(), arxiv: url.optional(), code: url.optional(), project: url.optional() })
      .default({}),
    note: bi.optional(), // e.g. "Oral presentation"
  });

  const newsItem = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    text: bi,
    link: url.optional(),
  });

  const openSource = z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    project: z.string(),
    url: url,
    description: bi,
    contributions: z.array(
      z.object({
        title: z.string(),
        url: url,
        status: z.enum(['merged', 'open', 'closed']),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    ),
  });

  const cv = z.object({
    sections: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        title: bi,
        items: z.array(
          z.object({
            heading: bi,
            sub: bi.optional(),
            dates: z.string().optional(),
            details: z.array(bi).default([]),
          }),
        ),
      }),
    ),
  });

  const note = z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    lang: z.enum(['en', 'zh']),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  });

  return { bi, profile, publication, newsItem, openSource, cv, note };
};

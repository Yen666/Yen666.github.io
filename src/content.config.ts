import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { makeSchemas } from './schemas.mjs';

const { note } = makeSchemas(z);

// Entry ids are `${lang}/${slug}` built from FRONTMATTER, not file paths, so moving files never breaks URLs.
const notes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/notes',
    generateId: ({ data }) => `${data.lang}/${data.slug}`,
  }),
  schema: note,
});

export const collections = { notes };

// Import the glob loader
import { glob } from "astro/loaders";
// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
// Define a `loader` and `schema` for each collection
const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/blog" }),
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      updatedDate: z.date().optional(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }),
    })
});

const privacyPolicy = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    og_title: z.string(),
    og_description: z.string(),
    og_type: z.string(),
    og_url: z.string(),
  })
});

export const collections = { blog, privacyPolicy };
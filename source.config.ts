import {
  defineDocs,
  defineConfig,
  defineCollections,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";
import { codeThemes } from "./src/lib/code-theme";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});
export const reference = defineDocs({ dir: "content/reference" });
export const integrations = defineDocs({
  dir: "content/integrations",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: frontmatterSchema.extend({
    date: z.string().date().or(z.date()),
  }),
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

/**
 * Fragments of the country-specific getting started guide. These are not pages
 * of their own: `src/lib/country-guides.ts` chains a subset of them together
 * per answer combination, and the guide route renders the chain as one page.
 */
export const guideFragments = defineCollections({
  type: "doc",
  dir: "content/guides",
  schema: z.object({
    /** Short label for the fragment, only used by contributors. */
    title: z.string(),
  }),
  postprocess: {
    includeProcessedMarkdown: true,
  },
});

export const faq = defineDocs({
  dir: "content/faq",
  docs: {
    schema: pageSchema.extend({
      category: z.string().optional(),
      excerpt: z.string().optional(),
      updatedAt: z.string().or(z.date()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig({
  mdxOptions: {
    // Brand code themes (src/lib/code-theme.ts) replace the github-light/dark
    // defaults. Only `themes` is overridden: fumadocs' default transformers,
    // meta parsing and `defaultColor: false` (CSS variables mode) are kept.
    rehypeCodeOptions: {
      themes: codeThemes,
    },
  },
});

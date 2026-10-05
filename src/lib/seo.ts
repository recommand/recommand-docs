import type { StructuredData } from "fumadocs-core/mdx-plugins";
import type { Metadata } from "next";

const TITLE_SUFFIX = " - Recommand Docs";
// Search results truncate titles past roughly 70 characters and descriptions
// past roughly 160; descriptions under 100 characters leave room unused.
const MAX_TITLE_LENGTH = 70;
const MIN_DESCRIPTION_LENGTH = 110;
const MAX_DESCRIPTION_LENGTH = 155;

/** The root layout's title template; pages pass their own name for %s. */
export const titleTemplate = `%s${TITLE_SUFFIX}`;

/**
 * Page title with the site suffix only when the result still fits. Long
 * titles, such as FAQ questions and changelog entries, go out on their own.
 */
export function pageTitle(title: string): Metadata["title"] {
  return title.length + TITLE_SUFFIX.length <= MAX_TITLE_LENGTH
    ? title
    : { absolute: title };
}

/** The paragraphs of a page, in order, as plain text. */
export function bodyText(structuredData: StructuredData | undefined): string[] {
  return structuredData?.contents.map((block) => block.content) ?? [];
}

/**
 * A meta description from a page's summary. A summary shorter than search
 * results allow is continued with the following texts, usually the page's
 * opening paragraphs; the result is cut to length, ending on a full sentence
 * when one fits and otherwise at a word with an ellipsis.
 */
export function metaDescription(
  ...texts: (string | undefined)[]
): string | undefined {
  let description = "";
  for (const text of texts) {
    const clean = text?.replace(/\s+/g, " ").trim();
    if (!clean) continue;
    description = description ? `${withStop(description)} ${clean}` : clean;
    if (description.length >= MIN_DESCRIPTION_LENGTH) break;
  }
  if (!description) return undefined;
  if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

  const head = description.slice(0, MAX_DESCRIPTION_LENGTH + 1);
  const sentenceEnd = Math.max(
    head.lastIndexOf(". "),
    head.lastIndexOf("! "),
    head.lastIndexOf("? "),
  );
  if (sentenceEnd + 1 >= MIN_DESCRIPTION_LENGTH) {
    return description.slice(0, sentenceEnd + 1);
  }
  const wordEnd = head.lastIndexOf(" ", MAX_DESCRIPTION_LENGTH - 1);
  return `${description.slice(0, wordEnd).replace(/[\s,;:.-]+$/, "")}…`;
}

function withStop(text: string): string {
  return /[.!?:]$/.test(text) ? text : `${text}.`;
}

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * Open Graph and Twitter defaults shared by every page. A page that sets its
 * own openGraph or twitter object replaces the layout's rather than merging
 * with it, so the helpers below spread these back in.
 */
export const defaultOpenGraph = {
  siteName: "Recommand Docs",
  type: "website",
  locale: "en_BE",
  images: ["/rcmd-opengraph.jpg"],
} satisfies OpenGraph;

export const defaultTwitter = {
  card: "summary_large_image",
  images: ["/rcmd-opengraph.jpg"],
} satisfies NonNullable<Metadata["twitter"]>;

/** Open Graph for a page, naming its own URL as og:url. */
export function openGraphFor(
  url: string,
  overrides: { title?: string; description?: string; type?: "article" } = {},
): OpenGraph {
  return { ...defaultOpenGraph, ...overrides, url };
}

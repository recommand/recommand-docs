import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm";
import { toString as mdastToString } from "mdast-util-to-string";
import { remark } from "remark";

const parseMarkdown = remark().use(remarkGfm);

/**
 * OpenAPI descriptions are markdown. Meta tags, search, and the page tree
 * want the words only.
 */
export function markdownToPlainText(markdown: string): string {
  return mdastToString(parseMarkdown.parse(markdown))
    .replace(/\s+/g, " ")
    .trim();
}

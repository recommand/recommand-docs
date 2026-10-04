import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm";
import type { Root } from "hast";
import { type Components, toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import { getMDXComponents } from "@/components/mdx-components";

/**
 * Render a description with the same GFM pipeline and components as the rest
 * of the docs, so blockquotes, emphasis, code, and links match the page body.
 */
export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(function rehypeToJsx() {
      this.compiler = (tree) =>
        toJsxRuntime(tree as Root, {
          ...runtime,
          development: false,
          // MDX's component map also allows nested namespaces (`<Foo.Bar>`),
          // which plain HTML from a description never produces.
          components: getMDXComponents() as Components,
        });
    })
    .process({ value: markdown });

  return file.result as ReactNode;
}

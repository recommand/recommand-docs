import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm";
import type {
  BlockContent,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { toString as mdastToString } from "mdast-util-to-string";
import { remark } from "remark";
import remarkMdx from "remark-mdx";

/**
 * The processed markdown of a page still contains the MDX components it was
 * written with (`<Callout>`, `<Tabs>`, `<Cards>`, ...) and the heading ids
 * fumadocs appends (`## Overview [#overview]`). Readers of the markdown
 * version, mostly agents, get plain markdown instead: each component becomes
 * the markdown it stands for, and unknown components keep only their content.
 */

const processor = remark().use(remarkMdx).use(remarkGfm);

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

const calloutLabels: Record<string, string> = {
  info: "Note",
  warn: "Warning",
  warning: "Warning",
  error: "Important",
  success: "Tip",
  tip: "Tip",
};

const genericTitles = new Set([
  "info",
  ...Object.values(calloutLabels).map((label) => label.toLowerCase()),
]);

const phrasingTypes = new Set([
  "text",
  "emphasis",
  "strong",
  "delete",
  "inlineCode",
  "link",
  "linkReference",
  "image",
  "imageReference",
  "break",
  "html",
]);

function attribute(node: JsxElement, name: string): string | undefined {
  for (const attr of node.attributes) {
    if (
      attr.type === "mdxJsxAttribute" &&
      attr.name === name &&
      typeof attr.value === "string"
    ) {
      return attr.value;
    }
  }
  return undefined;
}

const text = (value: string): PhrasingContent => ({ type: "text", value });

const paragraph = (children: PhrasingContent[]): Paragraph => ({
  type: "paragraph",
  children,
});

const strong = (value: string): Paragraph =>
  paragraph([{ type: "strong", children: [text(value)] }]);

/** Wraps loose inline content, as JSX children can be, into paragraphs. */
function asBlocks(nodes: RootContent[]): BlockContent[] {
  const blocks: BlockContent[] = [];
  let inline: PhrasingContent[] = [];
  const flush = () => {
    if (inline.length > 0) blocks.push(paragraph(inline));
    inline = [];
  };
  for (const node of nodes) {
    if (phrasingTypes.has(node.type)) {
      inline.push(node as PhrasingContent);
    } else {
      flush();
      blocks.push(node as BlockContent);
    }
  }
  flush();
  return blocks;
}

function cardItem(card: JsxElement): ListItem {
  const title = attribute(card, "title") ?? "";
  const href = attribute(card, "href");
  const description = mdastToString({
    type: "root",
    children: flatten(card.children as RootContent[]),
  })
    .replace(/\s+/g, " ")
    .trim();

  const label: PhrasingContent = href
    ? { type: "link", url: href, children: [text(title)] }
    : text(title);
  return {
    type: "listItem",
    spread: false,
    children: [
      paragraph(description ? [label, text(`: ${description}`)] : [label]),
    ],
  };
}

function convert(node: JsxElement): RootContent[] {
  const children = flatten(node.children as RootContent[]);

  switch (node.name) {
    case "Callout": {
      const type = attribute(node, "type") ?? "info";
      const label = calloutLabels[type] ?? "Note";
      // A title such as "Note" on a warning says nothing the label does not.
      const title = attribute(node, "title");
      const generic = !title || genericTitles.has(title.toLowerCase());
      const heading = generic
        ? label
        : label === "Note"
          ? title
          : `${label}: ${title}`;
      return [
        {
          type: "blockquote",
          children: [strong(heading), ...asBlocks(children)],
        },
      ];
    }
    case "Tab": {
      const label = attribute(node, "value") ?? attribute(node, "title");
      return label ? [strong(label), ...children] : children;
    }
    case "Cards": {
      const cards = node.children.filter(
        (child): child is JsxElement =>
          (child.type === "mdxJsxFlowElement" ||
            child.type === "mdxJsxTextElement") &&
          child.name === "Card",
      );
      if (cards.length === 0) return children;
      return [
        {
          type: "list",
          ordered: false,
          spread: false,
          children: cards.map(cardItem),
        },
      ];
    }
    case "Card":
      return cardItem(node).children;
    case "img": {
      const src = attribute(node, "src");
      if (!src) return [];
      const image: PhrasingContent = {
        type: "image",
        url: src,
        alt: attribute(node, "alt") ?? "",
      };
      return node.type === "mdxJsxFlowElement" ? [paragraph([image])] : [image];
    }
    default:
      // Tabs, layout wrappers such as <div className="fd-steps"> and any
      // component without a markdown equivalent: keep the content.
      return children;
  }
}

function flatten(nodes: RootContent[]): RootContent[] {
  return nodes.flatMap((node): RootContent[] => {
    switch (node.type) {
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement":
        return convert(node);
      case "mdxjsEsm":
      case "mdxFlowExpression":
      case "mdxTextExpression":
        return [];
      default:
        if ("children" in node) {
          (node as { children: RootContent[] }).children = flatten(
            node.children as RootContent[],
          );
        }
        return [node];
    }
  });
}

export function flattenMdx(markdown: string): string {
  const withoutHeadingIds = markdown.replace(
    /^([ \t]*#{1,6} .*?)[ \t]*\[#[^\]\s]+\][ \t]*$/gm,
    "$1",
  );

  try {
    const tree = processor.parse(withoutHeadingIds) as Root;
    tree.children = flatten(tree.children);
    return processor.stringify(tree);
  } catch (error) {
    // Content that does not parse as MDX is still useful as it is.
    console.error("Could not flatten MDX for the markdown version", error);
    return withoutHeadingIds;
  }
}

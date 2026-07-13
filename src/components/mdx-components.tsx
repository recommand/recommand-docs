import defaultMdxComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Callout } from "fumadocs-ui/components/callout";
import { Heading } from "fumadocs-ui/components/heading";
import { createAPIPage } from "fumadocs-openapi/ui";
import Link from "fumadocs-core/link";
import {
  openapi,
  openapiShikiConfig,
  openapiShikiOptions,
} from "@/lib/openapi";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

const APIPage = createAPIPage(openapi, {
  schemaUI: {
    showExample: true,
  },
  shiki: openapiShikiConfig,
  shikiOptions: openapiShikiOptions,
});

function cx(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Content headings stay Rethink Sans (per the brand's marketing/product type
 * split) but get slightly tighter tracking and normalized weights.
 */
function heading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6", extra: string) {
  return function MdxHeading(props: ComponentProps<"h2">) {
    return <Heading as={as} {...props} className={cx(extra, props.className)} />;
  };
}

/** Prose links: folder-dark ink with a quiet mint underline that fills on hover. */
function MdxLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cx(
        "font-medium text-folder-dark underline decoration-folder-dark/35 decoration-1 underline-offset-[3px] transition-colors hover:decoration-folder-dark dark:text-folder dark:decoration-folder/40 dark:hover:decoration-folder",
        props.className,
      )}
    />
  );
}

/**
 * Tables in the ledger spirit: hairline borders, eyebrow-ish header row on a
 * warm paper tint, tabular numerals so numeric columns align.
 */
function MdxTable(props: ComponentProps<"table">) {
  return (
    <div className="prose-no-margin relative my-6 overflow-auto">
      <table
        {...props}
        className={cx(
          "rounded-xl border-darkslate/10 dark:border-sheet/15",
          "[&_td]:border-darkslate/10 [&_th]:border-darkslate/10 dark:[&_td]:border-sheet/15 dark:[&_th]:border-sheet/15",
          "[&_thead_th]:bg-paper/50 dark:[&_thead_th]:bg-sheet/5",
          "[&_thead_th]:text-[0.6875rem] [&_thead_th]:font-bold [&_thead_th]:uppercase [&_thead_th]:tracking-[0.12em]",
          "[&_thead_th]:text-stone-dark dark:[&_thead_th]:text-stone",
          "[&_tbody_td]:tabular-nums",
          props.className,
        )}
      />
    </div>
  );
}

/** Callouts keep their brand token colors; borders become hairlines. */
function MdxCallout(props: ComponentProps<typeof Callout>) {
  return (
    <Callout
      {...props}
      className={cx(
        "rounded-xl border-darkslate/10 shadow-sm dark:border-sheet/15",
        props.className,
      )}
    />
  );
}

/** Dashed hairline rules, echoing the document-sheet inner separators. */
function MdxHr(props: ComponentProps<"hr">) {
  return (
    <hr
      {...props}
      className={cx(
        "border-t border-dashed border-darkslate/15 dark:border-sheet/15",
        props.className,
      )}
    />
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    h1: heading("h1", "font-bold tracking-[-0.015em]"),
    h2: heading("h2", "font-semibold tracking-[-0.015em]"),
    h3: heading("h3", "font-semibold tracking-[-0.01em]"),
    h4: heading("h4", "font-semibold tracking-[-0.01em]"),
    a: MdxLink,
    table: MdxTable,
    hr: MdxHr,
    Callout: MdxCallout,
    Tab,
    Tabs,
    APIPage,
    ...components,
  };
}

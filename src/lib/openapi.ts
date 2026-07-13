import { configDefault } from "fumadocs-core/highlight";
import { defineShikiConfig } from "fumadocs-core/highlight/config";
import { createOpenAPI } from "fumadocs-openapi/server";
import type { CreateAPIPageOptions } from "fumadocs-openapi/ui";
import { codeThemes } from "./code-theme";

export const openapi = createOpenAPI({
  input: ["https://app.recommand.eu/openapi"],
});

/**
 * Brand shiki theming for the API reference (see src/lib/code-theme.ts).
 *
 * Wire both into `createAPIPage` (src/components/mdx-components.tsx):
 *
 *   const APIPage = createAPIPage(openapi, {
 *     shiki: openapiShikiConfig,
 *     shikiOptions: openapiShikiOptions,
 *     ...
 *   });
 *
 * - `shiki` themes the server-side highlighter (markdown descriptions and
 *   the default code-block renderer).
 * - `shikiOptions` is serialized to the client and themes the dynamic
 *   highlights (code-sample usage tabs, playground responses).
 */
export const openapiShikiConfig = defineShikiConfig({
  defaultThemes: { themes: codeThemes },
  // Reuse fumadocs' shared highlighter instance (JS regex engine).
  createHighlighter: configDefault.createHighlighter,
});

export const openapiShikiOptions: CreateAPIPageOptions["shikiOptions"] = {
  themes: codeThemes,
};

"use client";

import { createOpenAPIPage } from "fumadocs-openapi/ui";
import { Schema } from "@/components/api/schema";
import { codeThemes } from "@/lib/code-theme";

/**
 * API reference page. A client component: the reference page preloads the
 * OpenAPI document on the server and passes it in (see
 * `openapi.preloadOpenAPIPage()` in src/app/(docs)/reference).
 *
 * `shikiOptions` brands every highlight on the page, both the server-rendered
 * code blocks and the dynamic ones (usage tabs, playground responses), with
 * the same themes as the rest of the docs (src/lib/code-theme.ts).
 */
export const OpenAPIPage = createOpenAPIPage({
  components: {
    // Local copy of the Schema UI, see src/components/api/schema/client.tsx.
    SchemaUI: Schema,
  },
  schemaUI: {
    showExample: true,
  },
  shikiOptions: {
    themes: codeThemes,
  },
});

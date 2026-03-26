import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";
import fs from "fs";
import path from "path";

// ──────────────────────────────────────────────
// Shared constants
// ──────────────────────────────────────────────

const SPEC_URL = "https://app.recommand.eu/openapi";
const REFERENCE_DIR = "./content/reference";
const REFERENCE_MD_DIR = "./content/reference-md";

const tagOrder = [
  "authentication",
  "sending",
  "recipients",
  "documents",
  "companies",
  "company-identifiers",
  "company-document-types",
  "company-notification-email-addresses",
  "playgrounds",
  "labels",
  "suppliers",
  "customers",
  "webhooks",
];

const tagDisplayNames: Record<string, string> = {
  authentication: "Authentication",
  sending: "Sending",
  recipients: "Recipients",
  documents: "Documents",
  companies: "Companies",
  "company-identifiers": "Company Identifiers",
  "company-document-types": "Company Document Types",
  "company-notification-email-addresses": "Notification Emails",
  playgrounds: "Playgrounds",
  labels: "Labels",
  suppliers: "Suppliers",
  customers: "Customers",
  webhooks: "Webhooks",
};

const tagDescriptions: Record<string, string> = {
  authentication: "Verify authentication and manage API credentials.",
  sending: "Send Peppol documents such as invoices and credit notes.",
  recipients: "Verify recipient presence on the Peppol network.",
  documents: "Retrieve, list, and manage sent and received documents.",
  companies: "Create and manage company profiles.",
  "company-identifiers": "Manage Peppol identifiers for your companies.",
  "company-document-types": "Configure supported document types per company.",
  "company-notification-email-addresses":
    "Manage notification email addresses for companies.",
  playgrounds: "Create and manage sandbox environments for testing.",
  labels: "Organize documents with labels.",
  suppliers: "Manage supplier records.",
  customers: "Manage customer records.",
  webhooks: "Configure webhook endpoints for real-time event notifications.",
};

function toKebabCase(operationId: string): string {
  return operationId.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// ──────────────────────────────────────────────
// Fetch spec once
// ──────────────────────────────────────────────

const specRes = await fetch(SPEC_URL);
const spec: any = await specRes.json();

// ──────────────────────────────────────────────
// Part 1: Fumadocs reference (content/reference)
// ──────────────────────────────────────────────

const openapi = createOpenAPI({ input: [SPEC_URL] });

await generateFiles({
  input: openapi,
  output: REFERENCE_DIR,
  includeDescription: true,
  per: "operation",
  groupBy: "tag",
  name(output, document) {
    let defaultName: string;
    if (output.type === "operation") {
      const operation =
        document.paths?.[output.item.path]?.[output.item.method];
      defaultName = operation?.operationId ?? output.item.path;
    } else {
      const hook =
        document.webhooks?.[output.item.name]?.[output.item.method];
      defaultName = hook?.operationId ?? output.item.name;
    }
    return toKebabCase(defaultName);
  },
});

// Build ordered list of operation slugs per tag from the spec
const tagOperations: Record<string, string[]> = {};
for (const [pathStr, methods] of Object.entries(spec.paths ?? {})) {
  for (const [method, op] of Object.entries(methods as Record<string, any>)) {
    if (!op?.tags) continue;
    const operationId: string = op.operationId ?? pathStr;
    const slug = toKebabCase(operationId);
    for (const tag of op.tags) {
      const tagSlug = tag.replace(/\s+/g, "-").toLowerCase();
      if (!tagOperations[tagSlug]) tagOperations[tagSlug] = [];
      tagOperations[tagSlug].push(slug);
    }
  }
}

// Write root meta.json with ordered pages
fs.writeFileSync(
  path.join(REFERENCE_DIR, "meta.json"),
  JSON.stringify({ title: "API Reference", pages: [...tagOrder] }, null, 2),
);

// Write meta.json for each tag folder with spec-order pages, find first endpoint
const tagFirstEndpoint: Record<string, string> = {};

for (const tag of tagOrder) {
  const tagDir = path.join(REFERENCE_DIR, tag);
  if (fs.existsSync(tagDir)) {
    const displayName = tagDisplayNames[tag] || tag;
    const orderedPages = tagOperations[tag] ?? [];

    const tagMeta: Record<string, any> = { title: displayName };
    if (orderedPages.length > 0) {
      tagMeta.pages = orderedPages;
    }
    fs.writeFileSync(
      path.join(tagDir, "meta.json"),
      JSON.stringify(tagMeta, null, 2),
    );

    // Remove any previously generated index.mdx
    const indexPath = path.join(tagDir, "index.mdx");
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
    }

    if (orderedPages.length > 0) {
      tagFirstEndpoint[tag] = orderedPages[0];
    }
  }
}

// Generate root index.mdx with cards linking to first endpoint in each tag
const rootCards = tagOrder
  .filter((tag) => tagFirstEndpoint[tag])
  .map(
    (tag) =>
      `  <Card href="/reference/${tag}/${tagFirstEndpoint[tag]}" title="${tagDisplayNames[tag] || tag}">
    ${tagDescriptions[tag] || ""}
  </Card>`,
  )
  .join("\n");

const rootIndexContent = `---
title: API Reference
description: Complete API reference for the Recommand Peppol API. Explore all endpoints for authentication, sending documents, managing companies, recipients, webhooks, and more.
---

Explore the full Recommand Peppol API. Each section below covers a group of related endpoints with request and response details.

<Cards>
${rootCards}
</Cards>
`;

fs.writeFileSync(path.join(REFERENCE_DIR, "index.mdx"), rootIndexContent);

console.log(
  "Generated meta.json and index.mdx files for API reference structure",
);

// ──────────────────────────────────────────────
// Part 2: Plain markdown reference (content/reference-md)
// ──────────────────────────────────────────────

function resolveRef(obj: any, root: any): any {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;

  if ("$ref" in obj && typeof obj.$ref === "string") {
    const refPath = obj.$ref.replace(/^#\//, "").split("/");
    let resolved = root;
    for (const segment of refPath) {
      resolved = resolved?.[segment];
    }
    const result = resolveRef(resolved, root);
    if (result && typeof result === "object" && !result.title) {
      const refName = refPath[refPath.length - 1];
      if (refName) {
        result.title = refName.replace(/([a-z])([A-Z])/g, "$1 $2");
      }
    }
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => resolveRef(item, root));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveRef(value, root);
  }
  return result;
}

const resolved = resolveRef(spec, spec);

function isArrayType(prop: any): boolean {
  if (prop.type === "array") return true;
  if (Array.isArray(prop.type) && prop.type.includes("array")) return true;
  return false;
}

function renderType(schema: any): string {
  if (!schema) return "unknown";

  if (schema.enum) {
    if (schema.enum.length > 10) {
      return "string (enum)";
    }
    return schema.enum.map((v: any) => `\`${v}\``).join(" \\| ");
  }

  if (isArrayType(schema)) {
    const itemType = schema.items ? renderType(schema.items) : "any";
    const nullable =
      Array.isArray(schema.type) && schema.type.includes("null");
    return `${itemType}[]${nullable ? " \\| null" : ""}`;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.join(" \\| ");
  }

  if (schema.oneOf) {
    return schema.oneOf
      .map((s: any) => s.title || renderType(s))
      .join(" | ");
  }

  if (schema.anyOf) {
    return schema.anyOf
      .map((s: any) => s.title || renderType(s))
      .join(" | ");
  }

  if (schema.allOf) {
    return "object";
  }

  if (schema.type === "object" || schema.properties) {
    return "object";
  }

  if (schema.type) {
    let t = schema.type as string;
    if (schema.format) t += ` (${schema.format})`;
    return t;
  }

  return "any";
}

function buildPropertyDescription(prop: any): string {
  const parts: string[] = [];
  if (prop.description) parts.push(prop.description);
  if (prop.default !== undefined) parts.push(`Default: \`${prop.default}\``);
  if (prop.example !== undefined)
    parts.push(`Example: \`${JSON.stringify(prop.example)}\``);
  if (prop.const !== undefined) parts.push(`Value: \`${prop.const}\``);
  if (prop.enum) {
    parts.push(`Values: ${prop.enum.map((v: any) => `\`${v}\``).join(", ")}`);
  }
  if (prop.minItems !== undefined) parts.push(`Min items: ${prop.minItems}`);
  if (prop.format) parts.push(`Format: ${prop.format}`);
  if (prop.additionalProperties) {
    const ap = prop.additionalProperties;
    if (isArrayType(ap) && ap.items?.type === "string") {
      parts.push("Map of field names to arrays of error message strings");
    } else if (ap.type) {
      parts.push(`Map of string keys to ${renderType(ap)} values`);
    }
  }
  return parts
    .map((p) => p.replace(/\.+$/, ""))
    .join(". ")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function getNestedSchema(prop: any): any {
  if (isArrayType(prop) && prop.items) return prop.items;
  if (prop.type === "object" || prop.properties) return prop;
  if (prop.oneOf || prop.anyOf) return prop;
  return null;
}

function renderSchemaTable(schema: any, depth: number = 0): string {
  if (!schema) return "_No schema defined._\n";

  if (schema.oneOf || schema.anyOf) {
    const variants = schema.oneOf || schema.anyOf;
    const keyword = schema.oneOf ? "One of" : "Any of";
    const lines: string[] = [`**${keyword}:**\n`];
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const label =
        variant.title || variant.description || `Variant ${i + 1}`;
      lines.push(`#### ${label}\n`);
      lines.push(renderSchemaTable(variant, depth));
    }
    return lines.join("\n");
  }

  if (schema.allOf) {
    const merged: any = { type: "object", properties: {}, required: [] };
    for (const sub of schema.allOf) {
      if (sub.properties) {
        Object.assign(merged.properties, sub.properties);
      }
      if (sub.required) {
        merged.required.push(...sub.required);
      }
    }
    return renderSchemaTable(merged, depth);
  }

  if (isArrayType(schema) && schema.items) {
    const lines: string[] = ["_Array of:_\n"];
    lines.push(renderSchemaTable(schema.items, depth));
    return lines.join("\n");
  }

  if (schema.properties) {
    const required = new Set(schema.required ?? []);
    const lines: string[] = [];
    lines.push("| Name | Type | Required | Description |");
    lines.push("|------|------|----------|-------------|");

    for (const [name, prop] of Object.entries<any>(schema.properties)) {
      const typeStr = renderType(prop);
      const isRequired = required.has(name) ? "Yes" : "No";
      const desc = buildPropertyDescription(prop);
      lines.push(`| \`${name}\` | ${typeStr} | ${isRequired} | ${desc} |`);
    }
    lines.push("");

    for (const [name, prop] of Object.entries<any>(schema.properties)) {
      const nested = getNestedSchema(prop);
      if (!nested || depth >= 4) continue;

      if (nested.oneOf || nested.anyOf) {
        const variants = nested.oneOf || nested.anyOf;
        const keyword = nested.oneOf ? "One of" : "Any of";
        lines.push(`**\`${name}\`** (${keyword}):\n`);
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          const label =
            variant.title || variant.description || `Variant ${i + 1}`;
          lines.push(`#### ${label}\n`);
          lines.push(renderSchemaTable(variant, depth + 1));
        }
      } else if (nested.properties) {
        lines.push(`**\`${name}\`** properties:\n`);
        lines.push(renderSchemaTable(nested, depth + 1));
      }
    }

    return lines.join("\n");
  }

  const typeStr = renderType(schema);
  const desc = schema.description ? ` — ${schema.description}` : "";
  return `Type: \`${typeStr}\`${desc}\n`;
}

function generateEndpointMd(
  pathStr: string,
  method: string,
  operation: any,
): string {
  const title =
    operation.summary ||
    operation.operationId ||
    `${method.toUpperCase()} ${pathStr}`;
  const lines: string[] = [];

  lines.push(`---`);
  lines.push(`title: "${title}"`);
  lines.push(`---`);
  lines.push("");
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`\`${method.toUpperCase()} ${pathStr}\``);
  lines.push("");

  if (operation.description) {
    lines.push(operation.description);
    lines.push("");
  }

  // Authorization
  const security = operation.security ?? resolved.security;
  if (security && security.length > 0) {
    lines.push("## Authorization");
    lines.push("");
    const schemes = security
      .flatMap((s: any) => Object.keys(s))
      .map((name: string) => {
        const scheme = resolved.components?.securitySchemes?.[name];
        if (!scheme) return name;
        const desc = scheme.description ? ` — ${scheme.description}` : "";
        return `**${scheme.scheme?.toUpperCase() || name}**${desc}`;
      });
    for (const s of schemes) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  // Parameters
  const params: any[] = operation.parameters ?? [];
  const pathParams = params.filter((p: any) => p.in === "path");
  const queryParams = params.filter((p: any) => p.in === "query");
  const headerParams = params.filter((p: any) => p.in === "header");

  if (params.length > 0) {
    lines.push("## Parameters");
    lines.push("");

    if (pathParams.length > 0) {
      lines.push("### Path Parameters");
      lines.push("");
      lines.push("| Name | Type | Required | Description |");
      lines.push("|------|------|----------|-------------|");
      for (const p of pathParams) {
        const desc = p.schema?.description || p.description || "";
        const type = renderType(p.schema);
        lines.push(
          `| \`${p.name}\` | ${type} | ${p.required ? "Yes" : "No"} | ${desc.replace(/\n/g, " ")} |`,
        );
      }
      lines.push("");
    }

    if (queryParams.length > 0) {
      lines.push("### Query Parameters");
      lines.push("");
      lines.push("| Name | Type | Required | Description |");
      lines.push("|------|------|----------|-------------|");
      for (const p of queryParams) {
        const desc = p.schema?.description || p.description || "";
        const type = renderType(p.schema);
        lines.push(
          `| \`${p.name}\` | ${type} | ${p.required ? "Yes" : "No"} | ${desc.replace(/\n/g, " ")} |`,
        );
      }
      lines.push("");
    }

    if (headerParams.length > 0) {
      lines.push("### Header Parameters");
      lines.push("");
      lines.push("| Name | Type | Required | Description |");
      lines.push("|------|------|----------|-------------|");
      for (const p of headerParams) {
        const desc = p.schema?.description || p.description || "";
        const type = renderType(p.schema);
        lines.push(
          `| \`${p.name}\` | ${type} | ${p.required ? "Yes" : "No"} | ${desc.replace(/\n/g, " ")} |`,
        );
      }
      lines.push("");
    }
  }

  // Request Body
  const requestBody = operation.requestBody;
  if (requestBody) {
    lines.push("## Request Body");
    lines.push("");
    if (requestBody.description) {
      lines.push(requestBody.description);
      lines.push("");
    }
    const content = requestBody.content;
    if (content) {
      for (const [mediaType, mediaObj] of Object.entries<any>(content)) {
        if (Object.keys(content).length > 1) {
          lines.push(`**Content-Type:** \`${mediaType}\``);
          lines.push("");
        }
        if (mediaObj.schema) {
          lines.push(renderSchemaTable(mediaObj.schema));
        }
      }
    }
  }

  // Responses
  const responses = operation.responses;
  if (responses) {
    lines.push("## Responses");
    lines.push("");
    for (const [statusCode, response] of Object.entries<any>(responses)) {
      const statusLabel = response.description || statusCode;
      lines.push(`### ${statusCode} ${statusLabel}`);
      lines.push("");
      const content = response.content;
      if (content) {
        for (const [, mediaObj] of Object.entries<any>(content)) {
          if (mediaObj.schema) {
            lines.push(renderSchemaTable(mediaObj.schema));
          }
        }
      } else {
        lines.push("_No response body._");
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

// Clean output directory
if (fs.existsSync(REFERENCE_MD_DIR)) {
  fs.rmSync(REFERENCE_MD_DIR, { recursive: true });
}
fs.mkdirSync(REFERENCE_MD_DIR, { recursive: true });

interface EndpointInfo {
  slug: string;
  title: string;
  method: string;
  path: string;
  tagSlug: string;
}

const allEndpoints: EndpointInfo[] = [];

for (const [pathStr, methods] of Object.entries<any>(resolved.paths ?? {})) {
  for (const [method, operation] of Object.entries<any>(methods)) {
    if (!operation?.tags || !operation.operationId) continue;

    const operationId: string = operation.operationId;
    const slug = toKebabCase(operationId);
    const title =
      operation.summary || operationId.replace(/([a-z])([A-Z])/g, "$1 $2");

    for (const tag of operation.tags) {
      const tagSlug = tag.replace(/\s+/g, "-").toLowerCase();

      if (!tagOrder.includes(tagSlug)) continue;

      const tagDir = path.join(REFERENCE_MD_DIR, tagSlug);
      if (!fs.existsSync(tagDir)) {
        fs.mkdirSync(tagDir, { recursive: true });
      }

      const md = generateEndpointMd(pathStr, method, operation);
      fs.writeFileSync(path.join(tagDir, `${slug}.md`), md);

      allEndpoints.push({ slug, title, method, path: pathStr, tagSlug });
    }
  }
}

// Generate index.md
const indexLines: string[] = [];
indexLines.push("---");
indexLines.push("title: API Reference");
indexLines.push("---");
indexLines.push("");
indexLines.push("# Recommand Peppol API Reference");
indexLines.push("");
indexLines.push(
  "Complete API reference for the Recommand Peppol API. All endpoints require authentication via Basic Auth or JWT Bearer token.",
);
indexLines.push("");

for (const tagSlug of tagOrder) {
  const displayName = tagDisplayNames[tagSlug] || tagSlug;
  const endpoints = allEndpoints.filter((e) => e.tagSlug === tagSlug);
  if (endpoints.length === 0) continue;

  indexLines.push(`## ${displayName}`);
  indexLines.push("");
  for (const ep of endpoints) {
    indexLines.push(
      `- [${ep.title}](/reference/${ep.tagSlug}/${ep.slug}.mdx): \`${ep.method.toUpperCase()} ${ep.path}\``,
    );
  }
  indexLines.push("");
}

fs.writeFileSync(path.join(REFERENCE_MD_DIR, "index.md"), indexLines.join("\n"));

console.log(
  `Generated ${allEndpoints.length} endpoint markdown files in ${REFERENCE_MD_DIR}/`,
);

// ──────────────────────────────────────────────
// Part 3: Models pages (content/reference/models)
// ──────────────────────────────────────────────

const MODELS_DIR = path.join(REFERENCE_DIR, "models");

// Clean and recreate models directory
if (fs.existsSync(MODELS_DIR)) {
  fs.rmSync(MODELS_DIR, { recursive: true });
}
fs.mkdirSync(MODELS_DIR, { recursive: true });

const schemas = resolved.components?.schemas ?? {};
const modelSlugs: string[] = [];

function renderModelPropertyRow(
  name: string,
  prop: any,
  required: boolean,
  anchor?: string,
): string {
  const typeStr = renderType(prop);
  const req = required ? "Yes" : "No";
  const desc = buildPropertyDescription(prop);
  const nameCell = anchor
    ? `[\`${name}\`](#${anchor})`
    : `\`${name}\``;
  return `| ${nameCell} | ${typeStr} | ${req} | ${desc} |`;
}

for (const [schemaName, schema] of Object.entries<any>(schemas)) {
  const slug = toKebabCase(schemaName);
  const title = schema.title || schemaName.replace(/([a-z])([A-Z])/g, "$1 $2");
  const description = schema.description || "";

  const lines: string[] = [];
  lines.push("---");
  lines.push(`title: "${title}"`);
  if (description) {
    lines.push(
      `description: "${description.replace(/"/g, '\\"').replace(/\n/g, " ")}"`,
    );
  }
  lines.push("---");
  lines.push("");

  // Render properties table
  if (schema.properties) {
    const requiredSet = new Set(schema.required ?? []);

    // Determine which properties have nested sections and their anchor slugs
    const nestedAnchors = new Map<string, string>();
    for (const [propName, prop] of Object.entries<any>(schema.properties)) {
      const nested = getNestedSchema(prop);
      if (!nested || (!nested.properties && !nested.oneOf && !nested.anyOf))
        continue;
      if (nested.oneOf || nested.anyOf) {
        const keyword = nested.oneOf ? "one-of" : "any-of";
        nestedAnchors.set(propName, `${propName.toLowerCase()}-${keyword}`);
      } else {
        nestedAnchors.set(propName, `${propName.toLowerCase()}-properties`);
      }
    }

    lines.push("## Properties");
    lines.push("");
    lines.push("| Name | Type | Required | Description |");
    lines.push("|------|------|----------|-------------|");

    for (const [propName, prop] of Object.entries<any>(schema.properties)) {
      lines.push(
        renderModelPropertyRow(
          propName,
          prop,
          requiredSet.has(propName),
          nestedAnchors.get(propName),
        ),
      );
    }
    lines.push("");

    // Render nested object details (recursive)
    function renderNestedDetails(
      properties: Record<string, any>,
      prefix: string,
      depth: number,
    ) {
      if (depth > 4) return; // prevent infinite recursion
      for (const [propName, prop] of Object.entries<any>(properties)) {
        const nested = getNestedSchema(prop);
        if (!nested || (!nested.properties && !nested.oneOf && !nested.anyOf))
          continue;

        const heading = "#".repeat(Math.min(3 + depth, 6));

        if (nested.oneOf || nested.anyOf) {
          const variants = nested.oneOf || nested.anyOf;
          const keyword = nested.oneOf ? "One of" : "Any of";
          lines.push(
            `${heading} \`${prefix}${propName}\` (${keyword})`,
          );
          lines.push("");
          for (const variant of variants) {
            const label =
              variant.title || variant.description || renderType(variant);
            if (variant.properties) {
              lines.push(`**${label}:**`);
              if (variant.description) {
                lines.push("");
                lines.push(variant.description);
              }
              lines.push("");
              lines.push("| Name | Type | Required | Description |");
              lines.push("|------|------|----------|-------------|");
              const vReq = new Set(variant.required ?? []);
              for (const [vName, vProp] of Object.entries<any>(
                variant.properties,
              )) {
                lines.push(
                  renderModelPropertyRow(vName, vProp, vReq.has(vName)),
                );
              }
              lines.push("");
              // Recurse into variant properties
              renderNestedDetails(
                variant.properties,
                `${prefix}${propName}.`,
                depth + 1,
              );
            }
          }
        } else if (nested.properties) {
          lines.push(`${heading} \`${prefix}${propName}\` properties`);
          lines.push("");
          lines.push("| Name | Type | Required | Description |");
          lines.push("|------|------|----------|-------------|");
          const nReq = new Set(nested.required ?? []);
          for (const [nName, nProp] of Object.entries<any>(
            nested.properties,
          )) {
            lines.push(
              renderModelPropertyRow(nName, nProp, nReq.has(nName)),
            );
          }
          lines.push("");
          // Recurse into nested properties
          renderNestedDetails(
            nested.properties,
            `${prefix}${propName}.`,
            depth + 1,
          );
        }
      }
    }
    renderNestedDetails(schema.properties, "", 0);
  } else if (schema.anyOf || schema.oneOf) {
    // Top-level union type (e.g., VatTotals anyOf)
    const variants = schema.anyOf || schema.oneOf;
    const keyword = schema.anyOf ? "Any of" : "One of";
    lines.push(`## ${keyword}`);
    lines.push("");
    for (const variant of variants) {
      const label =
        variant.title || variant.description || renderType(variant);
      lines.push(`### ${label}`);
      lines.push("");
      if (variant.description) {
        lines.push(variant.description);
        lines.push("");
      }
      if (variant.properties) {
        lines.push("| Name | Type | Required | Description |");
        lines.push("|------|------|----------|-------------|");
        const vReq = new Set(variant.required ?? []);
        for (const [vName, vProp] of Object.entries<any>(variant.properties)) {
          lines.push(renderModelPropertyRow(vName, vProp, vReq.has(vName)));
        }
        lines.push("");
      }
    }
  } else if (schema.type === "string" || schema.type === "number") {
    // Simple type schema
    lines.push(`**Type:** \`${renderType(schema)}\``);
    lines.push("");
  }

  // Write used-by section (which endpoints reference this schema)
  const usedByEndpoints: { tag: string; slug: string; title: string }[] = [];
  for (const [pathStr, methods] of Object.entries<any>(spec.paths ?? {})) {
    for (const [, op] of Object.entries<any>(methods)) {
      if (!op?.operationId) continue;
      const opStr = JSON.stringify(op);
      if (opStr.includes(`"#/components/schemas/${schemaName}"`)) {
        const opSlug = toKebabCase(op.operationId);
        const opTag = op.tags?.[0]?.replace(/\s+/g, "-").toLowerCase();
        if (opTag) {
          usedByEndpoints.push({
            tag: opTag,
            slug: opSlug,
            title: op.summary || op.operationId,
          });
        }
      }
    }
  }

  if (usedByEndpoints.length > 0) {
    lines.push("## Used by");
    lines.push("");
    for (const ep of usedByEndpoints) {
      lines.push(
        `- [${ep.title}](/reference/${ep.tag}/${ep.slug})`,
      );
    }
    lines.push("");
  }

  fs.writeFileSync(path.join(MODELS_DIR, `${slug}.mdx`), lines.join("\n"));
  modelSlugs.push(slug);
}

// Write models meta.json
fs.writeFileSync(
  path.join(MODELS_DIR, "meta.json"),
  JSON.stringify({ title: "Models", pages: modelSlugs }, null, 2),
);

// Update root meta.json to include models
const rootMeta = JSON.parse(
  fs.readFileSync(path.join(REFERENCE_DIR, "meta.json"), "utf-8"),
);
if (!rootMeta.pages.includes("models")) {
  rootMeta.pages.push("models");
  fs.writeFileSync(
    path.join(REFERENCE_DIR, "meta.json"),
    JSON.stringify(rootMeta, null, 2),
  );
}

console.log(
  `Generated ${modelSlugs.length} model pages in ${MODELS_DIR}/`,
);

import { createOpenAPI } from "fumadocs-openapi/server";

export const SPEC_URL = "https://app.recommand.eu/openapi";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const subschemaMaps = ["properties", "patternProperties", "$defs"];
const subschemaLists = ["allOf", "anyOf", "oneOf", "prefixItems"];
const subschemas = ["items", "additionalProperties", "not"];

/**
 * Turn a schema's `example` into `examples: [example]`, recursively.
 *
 * The spec declares OpenAPI 3.1, whose schemas are JSON Schema 2020-12 and
 * carry `examples`, but it still writes the 3.0 keyword `example`. Fumadocs
 * only reads `examples`, so without this the reference shows no example
 * values and every generated request and response sample falls back to
 * placeholders like "string".
 */
function normalizeSchema(schema: unknown): void {
  if (!isObject(schema)) return;
  if ("example" in schema && !("examples" in schema)) {
    schema.examples = [schema.example];
    delete schema.example;
  }
  for (const key of subschemaMaps) {
    const map = schema[key];
    if (isObject(map))
      for (const sub of Object.values(map)) normalizeSchema(sub);
  }
  for (const key of subschemaLists) {
    const list = schema[key];
    if (Array.isArray(list)) for (const sub of list) normalizeSchema(sub);
  }
  for (const key of subschemas) normalizeSchema(schema[key]);
}

/** Normalize every schema in the document: components and inline `schema`s. */
function normalizeDocument(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) normalizeDocument(item);
    return;
  }
  if (!isObject(node)) return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "schema") normalizeSchema(value);
    else if (key === "schemas" && isObject(value)) {
      for (const schema of Object.values(value)) normalizeSchema(schema);
    } else normalizeDocument(value);
  }
}

export const openapi = createOpenAPI({
  input: {
    // Keyed by the URL, so generated pages keep `document={SPEC_URL}`.
    [SPEC_URL]: async () => {
      const response = await fetch(SPEC_URL);
      if (!response.ok) {
        throw new Error(`Fetching ${SPEC_URL} failed: ${response.status}`);
      }
      const document = await response.json();
      normalizeDocument(document);
      return document;
    },
  },
});

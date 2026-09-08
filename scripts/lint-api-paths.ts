/**
 * Checks that every API path written by hand in the docs is a path the API
 * actually serves.
 *
 * The reference pages are generated from the spec, so they cannot drift. The
 * hand-written guides, how-tos and FAQ entries can: a curl sample that hits
 * `/api/v1/{companyId}/identifiers` instead of
 * `/api/v1/companies/{companyId}/identifiers` renders perfectly, links to
 * nothing, and only fails when a reader pastes it into a terminal. Neither the
 * build nor the link checker sees that.
 *
 * So: pull every `/api/v1/...` path out of the code fences in `content/**`,
 * normalise the parameter segments, and assert each one matches a path in the
 * live spec. Parameter names are not compared, only their positions, because a
 * sample is free to call the segment `{companyId}`, `:companyId` or
 * `${companyId}` and all three are correct.
 */

import fs from "node:fs";
import path from "node:path";

const SPEC_URL = "https://app.recommand.eu/openapi";
const CONTENT_DIR = path.join(process.cwd(), "content");
const API_PREFIX = "/api/v1";

/** Files whose paths are generated from the spec and therefore cannot drift. */
const GENERATED_DIRS = ["reference", "reference-md"];

type Reference = { file: string; line: number; raw: string };

function contentFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relative = path.relative(CONTENT_DIR, full);
      if (GENERATED_DIRS.includes(relative)) continue;
      found.push(...contentFiles(full));
    } else if (/\.(mdx?|sh|json)$/.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

/**
 * The lines inside fenced code blocks. Prose mentions a path to talk about it
 * and is allowed to be loose ("the `/documents` endpoints"); a code block is
 * something a reader runs, so that is what is checked.
 *
 * `.sh` and `.json` samples under `content/samples/` are code all the way down
 * and are included into fences elsewhere, so they count in full.
 */
function codeLines(file: string, content: string): { line: number; text: string }[] {
  const lines = content.split("\n");
  if (!/\.mdx?$/.test(file)) {
    return lines.map((text, index) => ({ line: index + 1, text }));
  }

  const inside: { line: number; text: string }[] = [];
  let fenced = false;
  lines.forEach((text, index) => {
    if (/^\s*```/.test(text)) {
      fenced = !fenced;
      return;
    }
    if (fenced) inside.push({ line: index + 1, text });
  });
  return inside;
}

/** Every `/api/v1/...` path written in one line, with the surrounding URL, quotes and template syntax stripped. */
function extractPaths(text: string): string[] {
  const found: string[] = [];
  const pattern = /(?:https?:\/\/[^\s"'`)]*)?(\/api\/v1(?:\/[^\s"'`)>,;]*)*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const raw = match[1]
      // A query string is not part of the path.
      .replace(/\?.*$/, "")
      // Markdown and shell punctuation that can sit right after a path.
      .replace(/[.,;:)\\]+$/, "")
      .replace(/\/+$/, "");
    if (raw === API_PREFIX) continue;
    found.push(raw);
  }
  return found;
}

/**
 * Whether a segment stands for a value rather than being one. A sample is free
 * to write `{companyId}`, `:companyId`, `${companyId}`, `<companyId>` or the
 * `c_xxx` style placeholder the samples use, and all of them are correct.
 */
function isParameter(segment: string): boolean {
  return (
    /^\{.*\}$/.test(segment) ||
    /^\$\{.*\}$/.test(segment) ||
    /^:.+/.test(segment) ||
    /^<.*>$/.test(segment) ||
    /_xxx$/.test(segment) ||
    /^(your_|the_)?[a-z]+_id$/i.test(segment)
  );
}

/**
 * Whether a path written in the docs is served by one spec path. Segment
 * counts have to match; a spec parameter accepts anything in that position,
 * including a concrete value, because a sample that shows
 * `/documents/{documentId}/render/pdf` is showing a real call. A parameter in
 * the docs where the spec has a literal is a mismatch: that is exactly the
 * missing `/companies` prefix this check exists to catch.
 */
function matches(docPath: string, specPath: string): boolean {
  const docSegments = docPath.split("/");
  const specSegments = specPath.split("/");
  if (docSegments.length !== specSegments.length) return false;
  return specSegments.every((specSegment, index) => {
    const docSegment = docSegments[index];
    if (isParameter(specSegment)) return true;
    return specSegment === docSegment;
  });
}

async function main() {
  const response = await fetch(SPEC_URL);
  if (!response.ok) {
    console.error(
      `✗ Could not fetch the API spec from ${SPEC_URL}: ${response.status} ${response.statusText}`,
    );
    process.exit(1);
  }
  const spec = (await response.json()) as { paths?: Record<string, unknown> };
  const specPaths = Object.keys(spec.paths ?? {});
  if (specPaths.length === 0) {
    console.error(`✗ The API spec at ${SPEC_URL} has no paths.`);
    process.exit(1);
  }

  const apiPaths = specPaths.filter((specPath) =>
    specPath.startsWith(`${API_PREFIX}/`),
  );

  const references = new Map<string, Reference[]>();
  for (const file of contentFiles(CONTENT_DIR)) {
    const content = fs.readFileSync(file, "utf8");
    for (const { line, text } of codeLines(file, content)) {
      for (const raw of extractPaths(text)) {
        const relative = path.relative(process.cwd(), file);
        references.set(raw, [
          ...(references.get(raw) ?? []),
          { file: relative, line, raw },
        ]);
      }
    }
  }

  const errors: string[] = [];
  for (const [raw, uses] of [...references].sort()) {
    if (apiPaths.some((specPath) => matches(raw, specPath))) continue;
    const where = uses
      .map((use) => `${use.file}:${use.line}`)
      .join(", ");
    errors.push(`${raw} is not a path the API serves (${where})`);
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} API path problem(s):\n`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error(
      `\nCompare them against ${SPEC_URL}. Parameter names are not checked, only where the parameters sit.\n`,
    );
    process.exit(1);
  }

  console.log(
    `✓ ${references.size} distinct API paths in content/, all served by the API`,
  );
}

main();

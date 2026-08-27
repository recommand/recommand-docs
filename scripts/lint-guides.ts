/**
 * Two content checks the build cannot make on its own.
 *
 * The country-specific getting started guide is assembled from fragments in
 * `content/guides/`, and which fragments apply is decided by pattern rather than
 * by a list: `fragmentPaths` builds candidate paths out of the three answers and
 * keeps the ones that exist. That is what makes adding
 * `sending/reporting-belgium.mdx` enough to extend the Belgian guides — and also
 * what makes a misnamed file fail silently, since a fragment no chain asks for is
 * simply never rendered.
 *
 * This script closes that hole: every fragment on disk has to be reached by at
 * least one of the combinations, and every path a chain asks for has to exist.
 *
 * It also checks `content/samples/`, whose files are pulled into MDX with
 * fumadocs' `<include>` tag. A missing target already fails the build; a sample
 * nothing includes any more would not, so it is caught here.
 *
 * And it checks heading ids across a chain. Fragments are written on their own
 * but rendered as one page, so two of them reaching for the same obvious heading
 * ("Without writing code") produces two `#without-writing-code` anchors, a
 * duplicate React key in the table of contents, and a link that lands on
 * whichever one came first.
 */

import fs from "node:fs";
import path from "node:path";
import {
  allAnswers,
  fragmentCandidates,
  guideUrl,
} from "../src/lib/country-guides-data";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");
const SAMPLES_DIR = path.join(process.cwd(), "content", "samples");
const CONTENT_DIR = path.join(process.cwd(), "content");

function fragmentsOnDisk(): string[] {
  const found: string[] = [];
  for (const dir of fs.readdirSync(GUIDES_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    for (const file of fs.readdirSync(path.join(GUIDES_DIR, dir.name))) {
      if (!/\.mdx?$/.test(file)) continue;
      found.push(`${dir.name}/${file.replace(/\.mdx?$/, "")}`);
    }
  }
  return found.sort();
}

/**
 * The anchor a heading gets, close enough to what rehype-slug does for the
 * purpose of spotting collisions. An explicit `[#id]` suffix wins, as in MDX.
 */
function headingId(text: string): string {
  const explicit = /\[#([^\]]+)\]\s*$/.exec(text);
  if (explicit) return explicit[1];
  return text
    .replace(/`([^`]*)`/g, "$1")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** The `##`-and-deeper heading ids of one fragment, in document order. */
function headingIds(fragmentPath: string): string[] {
  const file = ["mdx", "md"]
    .map((ext) => path.join(GUIDES_DIR, `${fragmentPath}.${ext}`))
    .find((candidate) => fs.existsSync(candidate));
  if (!file) return [];
  const source = fs.readFileSync(file, "utf8");
  return [...source.matchAll(/^#{2,6}\s+(.+)$/gm)].map((match) =>
    headingId(match[1]),
  );
}

/** Every file under content/, so includes can be counted wherever they live. */
function contentFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...contentFiles(full));
    else if (/\.mdx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

/** Samples that no MDX file includes: dead weight, and usually a rename gone wrong. */
function unusedSamples(): string[] {
  if (!fs.existsSync(SAMPLES_DIR)) return [];
  const included = contentFiles(CONTENT_DIR)
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  return fs
    .readdirSync(SAMPLES_DIR)
    .filter((name) => name !== "README.md")
    .filter((name) => !included.includes(`content/samples/${name}`));
}

function main() {
  const onDisk = new Set(fragmentsOnDisk());
  const reached = new Set<string>();
  const errors: string[] = [];

  for (const answers of allAnswers()) {
    const chain = fragmentCandidates(answers).filter((candidate) =>
      onDisk.has(candidate),
    );
    for (const fragmentPath of chain) reached.add(fragmentPath);

    const headingOwner = new Map<string, string>();
    for (const fragmentPath of chain) {
      for (const id of headingIds(fragmentPath)) {
        const owner = headingOwner.get(id);
        if (owner && owner !== fragmentPath) {
          errors.push(
            `${guideUrl(answers)} renders "#${id}" twice, from ${owner} and ${fragmentPath} — give one of the two headings a different wording`,
          );
        }
        headingOwner.set(id, fragmentPath);
      }
    }

    // A guide is a page, so it needs the parts that every reader needs.
    for (const required of ["overview/", "country/", "support/common"]) {
      if (!chain.some((fragmentPath) => fragmentPath.startsWith(required))) {
        errors.push(
          `${guideUrl(answers)} has no ${required} fragment — the guide would render without it`,
        );
      }
    }
  }

  for (const sample of unusedSamples()) {
    errors.push(
      `content/samples/${sample} is never included by any MDX file. Delete it, or add an <include> for it.`,
    );
  }

  for (const fragmentPath of onDisk) {
    if (!reached.has(fragmentPath)) {
      errors.push(
        `content/guides/${fragmentPath}.mdx is never used: no combination asks for that path. Check the filename against the chain in src/lib/country-guides.ts.`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} guide fragment problem(s):\n`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    console.error("");
    process.exit(1);
  }

  const sampleCount = fs.existsSync(SAMPLES_DIR)
    ? fs.readdirSync(SAMPLES_DIR).filter((name) => name !== "README.md").length
    : 0;
  console.log(
    `✓ ${onDisk.size} guide fragments, all reachable from the ${allAnswers().length} guides`,
  );
  console.log(`✓ ${sampleCount} shared code samples, all included somewhere`);
}

main();

import path from "node:path";
import {
  printErrors,
  readFiles,
  scanURLs,
  validateFiles,
} from "next-validate-link";
import { allAnswers, countries } from "../src/lib/country-guides-data";

function extractHeadings(content: string): string[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].toLowerCase().replace(/\s+/g, "-"));
  }
  return headings;
}

function toSlugs(basedir: string, filePath: string): string[] {
  const rel = path
    .relative(basedir, filePath)
    .replace(/\.(md|mdx)$/, "");
  const parts = rel.split(path.sep);
  // index files map to the parent route (empty slug for [[...slug]])
  if (parts[parts.length - 1] === "index") {
    parts.pop();
  }
  return parts;
}

async function checkLinks() {
  const docsFiles = await readFiles("content/docs/**/*.{md,mdx}");
  const guideFragmentFiles = await readFiles("content/guides/**/*.{md,mdx}");
  const referenceFiles = await readFiles("content/reference/**/*.{md,mdx}");
  const integrationsFiles = await readFiles(
    "content/integrations/**/*.{md,mdx}"
  );
  const changelogFiles = await readFiles("content/changelog/**/*.{md,mdx}");
  const faqFiles = await readFiles("content/faq/**/*.{md,mdx}");

  const scanned = await scanURLs({
    preset: "next",
    populate: {
      "(docs)/docs/[[...slug]]": docsFiles.map((file) => ({
        value: toSlugs("content/docs", file.path),
        hashes: extractHeadings(file.content),
      })),
      // Only real files. A category folder such as /reference/companies is not
      // a page: generate-openapi.mts writes a meta.json for the sidebar and
      // deletes any index.mdx, so those URLs 404. Registering them as valid is
      // what let eight broken links reach production.
      "(docs)/reference/[[...slug]]": referenceFiles.map((file) => ({
        value: toSlugs("content/reference", file.path),
        hashes: extractHeadings(file.content),
      })),
      "(docs)/integrations/[[...slug]]": integrationsFiles.map((file) => ({
        value: toSlugs("content/integrations", file.path),
        hashes: extractHeadings(file.content),
      })),
      "(docs)/changelog/[[...slug]]": [
        // The changelog index has no file of its own: the route renders it for
        // the empty slug.
        { value: [] },
        ...changelogFiles.map((file) => ({
          value: toSlugs("content/changelog", file.path),
          hashes: extractHeadings(file.content),
        })),
      ],
      // Straight from the guide model, so a new country or direction is covered
      // here the moment it exists.
      "(docs)/getting-started/[country]": countries.map((country) => ({
        value: { country: country.id },
      })),
      "(docs)/getting-started/[country]/[audience]/[direction]": allAnswers().map(
        (answers) => ({
          value: {
            country: answers.country.id,
            audience: answers.audience.id,
            direction: answers.direction.id,
          },
        }),
      ),
      "(docs)/faq/[category]/[slug]": faqFiles.map((file) => {
        const parts = toSlugs("content/faq", file.path);
        return {
          value: { category: parts[0], slug: parts.slice(1).join("/") },
          hashes: extractHeadings(file.content),
        };
      }),
    },
  });

  const allFiles = [
    ...docsFiles,
    ...guideFragmentFiles,
    ...referenceFiles,
    ...integrationsFiles,
    ...changelogFiles,
    ...faqFiles,
  ];

  const results = await validateFiles(allFiles, {
    scanned,
    checkRelativePaths: "as-url",
    markdown: {
      components: {
        Card: { attributes: ["href"] },
        Cards: { attributes: ["href"] },
      },
    },
  });

  printErrors(results, true);
}

void checkLinks();

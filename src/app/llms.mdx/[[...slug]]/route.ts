import fs from "node:fs/promises";
import path from "node:path";
import {
  allAnswers,
  guideMarkdown,
  resolveAnswers,
} from "@/lib/country-guides";
import { getLLMText } from "@/lib/get-llm-text";
import {
  changelogSource,
  docsSource,
  faqSource,
  integrationsSource,
} from "@/lib/source";

export const revalidate = false;

/** slug = ["getting-started", country, audience, direction] */
async function getCountryGuideMd(slug: string[]): Promise<string | null> {
  const [, country, audience, direction] = slug;
  if (!country || !audience || !direction || slug.length !== 4) return null;

  const answers = resolveAnswers({ country, audience, direction });
  if (!answers) return null;

  return guideMarkdown(answers);
}

function findPage(slug?: string[]) {
  if (!slug || slug.length === 0) return null;

  const prefix = slug[0];
  const rest = slug.slice(1);

  switch (prefix) {
    case "docs":
      return docsSource.getPage(rest.length ? rest : undefined);
    case "integrations":
      return integrationsSource.getPage(rest.length ? rest : undefined);
    case "changelog":
      return changelogSource.getPage(rest.length ? rest : undefined);
    case "faq":
      return faqSource.getPage(rest.length ? rest : undefined);
    default:
      return null;
  }
}

/** The changelog and FAQ have no index page of their own: list their pages. */
function sectionIndex(section: string): string | null {
  const sections = {
    changelog: { title: "Changelog", source: changelogSource },
    faq: { title: "Frequently asked questions", source: faqSource },
  };
  const entry = sections[section as keyof typeof sections];
  if (!entry) return null;

  const lines = entry.source.getPages().map((page) => {
    const description = page.data.description
      ? `: ${page.data.description}`
      : "";
    return `- [${page.data.title ?? page.url}](${page.url}.mdx)${description}`;
  });
  return `# ${entry.title} (/${section})\n\n${lines.join("\n")}\n`;
}

async function getReferenceMd(slug: string[]): Promise<string | null> {
  // slug = ["reference"] is the endpoint index
  if (slug.length === 1) {
    try {
      return await fs.readFile(
        path.join(process.cwd(), "content/reference-md/index.md"),
        "utf-8",
      );
    } catch {
      return null;
    }
  }

  // slug = ["reference", tagSlug, operationSlug]

  // Try content/reference-md first (endpoint markdown)
  const mdPath = `${path.join(process.cwd(), "content/reference-md", ...slug.slice(1))}.md`;
  try {
    return await fs.readFile(mdPath, "utf-8");
  } catch {
    // ignore
  }

  // Fall back to content/reference (model MDX pages are plain markdown)
  const mdxPath = `${path.join(process.cwd(), "content/reference", ...slug.slice(1))}.mdx`;
  try {
    return await fs.readFile(mdxPath, "utf-8");
  } catch {
    return null;
  }
}

async function listReferenceMdParams(): Promise<{ slug: string[] }[]> {
  const params: { slug: string[] }[] = [];

  // Endpoint markdown files from content/reference-md
  const refMdDir = path.join(process.cwd(), "content/reference-md");
  try {
    const tags = await fs.readdir(refMdDir, { withFileTypes: true });
    for (const tag of tags) {
      if (!tag.isDirectory()) continue;
      const tagDir = path.join(refMdDir, tag.name);
      const files = await fs.readdir(tagDir);
      for (const file of files.filter((f) => f.endsWith(".md"))) {
        const name = file.replace(/\.md$/, "");
        params.push({ slug: ["reference", tag.name, name] });
      }
    }
  } catch {
    // directory doesn't exist yet
  }

  // Model MDX pages from content/reference/models
  const modelsDir = path.join(process.cwd(), "content/reference/models");
  try {
    const files = await fs.readdir(modelsDir);
    for (const file of files.filter((f) => f.endsWith(".mdx"))) {
      const name = file.replace(/\.mdx$/, "");
      params.push({ slug: ["reference", "models", name] });
    }
  } catch {
    // directory doesn't exist yet
  }

  return params;
}

// Pages are also served here when a client asks for them with
// `Accept: text/markdown` (see next.config.ts), so the response varies on it.
function markdown(content: string, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
  });
}

function notFoundMarkdown(slug: string[] | undefined) {
  const requested = `/${(slug ?? []).join("/")}`;
  return markdown(
    `# Page not found

There is no documentation page at \`${requested}\`.

- Index of all documentation pages: https://docs.recommand.eu/llms.txt
- Full documentation in one file: https://docs.recommand.eu/llms-full.txt
- API reference: https://docs.recommand.eu/reference.md
- OpenAPI specification: https://app.recommand.eu/openapi
`,
    404,
  );
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug?: string[] }> },
) {
  const params = await context.params;
  // `/docs/foo.md` requested with `Accept: text/markdown` arrives here with
  // its suffix still on.
  const slug = params.slug?.map((part, i, all) =>
    i === all.length - 1 ? part.replace(/\.mdx?$/, "") : part,
  );

  // Handle the assembled country-specific getting started guides
  if (slug && slug[0] === "getting-started") {
    const content = await getCountryGuideMd(slug);
    if (!content) return notFoundMarkdown(slug);
    return markdown(content);
  }

  // Handle reference markdown pages
  if (slug && slug[0] === "reference") {
    const content = await getReferenceMd(slug);
    if (!content) return notFoundMarkdown(slug);
    return markdown(content);
  }

  const page = findPage(slug);

  if (!page) {
    const index = slug?.length === 1 ? sectionIndex(slug[0]) : null;
    return index ? markdown(index) : notFoundMarkdown(slug);
  }

  return markdown(await getLLMText(page));
}

export async function generateStaticParams() {
  const allParams: { slug: string[] }[] = [];

  for (const page of docsSource.getPages()) {
    allParams.push({ slug: ["docs", ...page.slugs] });
  }
  for (const page of integrationsSource.getPages()) {
    allParams.push({ slug: ["integrations", ...page.slugs] });
  }
  for (const page of changelogSource.getPages()) {
    allParams.push({ slug: ["changelog", ...page.slugs] });
  }
  for (const page of faqSource.getPages()) {
    allParams.push({ slug: ["faq", ...page.slugs] });
  }
  for (const answers of allAnswers()) {
    allParams.push({
      slug: [
        "getting-started",
        answers.country.id,
        answers.audience.id,
        answers.direction.id,
      ],
    });
  }

  allParams.push({ slug: ["reference"] });
  const refParams = await listReferenceMdParams();
  allParams.push(...refParams);

  return allParams;
}

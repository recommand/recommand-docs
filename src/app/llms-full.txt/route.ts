import { docsSource, changelogSource, faqSource } from "@/lib/source";
import { getLLMText } from "@/lib/get-llm-text";
import fs from "fs/promises";
import path from "path";

export const revalidate = false;

async function getReferenceMdTexts(): Promise<string[]> {
  const refDir = path.join(process.cwd(), "content/reference-md");
  const texts: string[] = [];

  try {
    const tags = await fs.readdir(refDir, { withFileTypes: true });
    for (const tag of tags) {
      if (!tag.isDirectory()) continue;
      const tagDir = path.join(refDir, tag.name);
      const files = await fs.readdir(tagDir);
      for (const file of files.filter((f) => f.endsWith(".md"))) {
        const content = await fs.readFile(path.join(tagDir, file), "utf-8");
        // Strip frontmatter
        const body = content.replace(/^---[\s\S]*?---\s*/, "");
        texts.push(body.trim());
      }
    }
  } catch {
    // If reference-md doesn't exist, return empty
  }

  return texts;
}

async function getModelTexts(): Promise<string[]> {
  const modelsDir = path.join(process.cwd(), "content/reference/models");
  const texts: string[] = [];

  try {
    const files = await fs.readdir(modelsDir);
    for (const file of files.filter((f) => f.endsWith(".mdx"))) {
      const content = await fs.readFile(path.join(modelsDir, file), "utf-8");
      // Extract title from frontmatter
      const titleMatch = content.match(/^---[\s\S]*?title:\s*"([^"]+)"[\s\S]*?---/);
      const title = titleMatch?.[1] ?? file.replace(/\.mdx$/, "");
      // Strip frontmatter
      const body = content.replace(/^---[\s\S]*?---\s*/, "");
      texts.push(`# ${title} (Model)\n\n${body.trim()}`);
    }
  } catch {
    // If models directory doesn't exist, return empty
  }

  return texts;
}

export async function GET() {
  const allPages = [
    ...docsSource.getPages(),
    ...changelogSource.getPages(),
    ...faqSource.getPages(),
  ];

  const texts = await Promise.all(allPages.map(getLLMText));
  const refTexts = await getReferenceMdTexts();
  const modelTexts = await getModelTexts();

  return new Response([...texts, ...refTexts, ...modelTexts].join("\n\n"), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

import { docsSource, referenceSource, faqSource, integrationsSource, changelogSource } from "@/lib/source";
import { createSearchAPI } from "fumadocs-core/search/server";

function buildIndexTag(url: string): string {
  if (url.startsWith("/reference/models/")) return "model";
  if (url.startsWith("/reference")) return "endpoint";
  if (url.startsWith("/integrations")) return "integration";
  if (url.startsWith("/faq")) return "faq";
  if (url.startsWith("/changelog")) return "changelog";
  return "guide";
}

export const { GET } = createSearchAPI("advanced", {
  indexes: [
    docsSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: buildIndexTag(page.url),
    })),
    referenceSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: buildIndexTag(page.url),
    })),
    faqSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: buildIndexTag(page.url),
    })),
    integrationsSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: buildIndexTag(page.url),
    })),
    changelogSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
      tag: buildIndexTag(page.url),
    })),
  ].flat(),
});

import { docsSource, referenceSource, faqSource, integrationsSource, changelogSource } from "@/lib/source";
import { createSearchAPI } from "fumadocs-core/search/server";
import {
  allAnswers,
  guideChain,
  guideDescription,
  guideHeading,
  guideUrl,
} from "@/lib/country-guides";

function buildIndexTag(url: string): string {
  if (url.startsWith("/reference/models/")) return "model";
  if (url.startsWith("/reference")) return "endpoint";
  if (url.startsWith("/integrations")) return "integration";
  if (url.startsWith("/faq")) return "faq";
  if (url.startsWith("/changelog")) return "changelog";
  return "guide";
}

/**
 * The country guides have no page of their own to index, so the structured data
 * of a combination is the structured data of its fragments, in chain order.
 */
const countryGuideIndexes = allAnswers().map((answers) => {
  const chain = guideChain(answers);
  return {
    title: guideHeading(answers),
    description: guideDescription(answers),
    url: guideUrl(answers),
    id: guideUrl(answers),
    structuredData: {
      headings: chain.flatMap((fragment) => fragment.structuredData.headings),
      contents: chain.flatMap((fragment) => fragment.structuredData.contents),
    },
    tag: "guide",
  };
});

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
    countryGuideIndexes,
  ].flat(),
});

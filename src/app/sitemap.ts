import type { MetadataRoute } from "next";
import {
  docsSource,
  referenceSource,
  integrationsSource,
  changelogSource,
  faqSource,
} from "@/lib/source";
import { getCategories } from "@/lib/faq";
import {
  allAnswers,
  countries,
  countryUrl,
  GUIDE_BASE_URL,
  guideUrl,
} from "@/lib/country-guides";

const BASE_URL = "https://docs.recommand.eu";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  entries.push({ url: BASE_URL, lastModified: new Date() });
  entries.push({ url: `${BASE_URL}/faq`, lastModified: new Date() });

  // Country-specific getting started guides: the hub, one page per country and
  // one page per answer combination, so every variant can be indexed on its own.
  entries.push({ url: `${BASE_URL}${GUIDE_BASE_URL}`, lastModified: new Date() });
  for (const country of countries) {
    entries.push({
      url: `${BASE_URL}${countryUrl(country)}`,
      lastModified: new Date(),
    });
  }
  for (const answers of allAnswers()) {
    entries.push({
      url: `${BASE_URL}${guideUrl(answers)}`,
      lastModified: new Date(),
    });
  }

  // Docs pages
  for (const page of docsSource.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
    });
  }

  // API reference pages
  for (const page of referenceSource.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
    });
  }

  // Integration pages
  for (const page of integrationsSource.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
    });
  }

  // Changelog pages
  for (const page of changelogSource.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: page.data.date ? new Date(page.data.date) : new Date(),
    });
  }

  // FAQ pages
  for (const page of faqSource.getPages()) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: new Date(),
    });
  }

  // FAQ category pages
  for (const category of getCategories()) {
    entries.push({
      url: `${BASE_URL}/faq/${encodeURIComponent(category)}`,
      lastModified: new Date(),
    });
  }

  return entries;
}

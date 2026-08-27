import { DocsPage } from "fumadocs-ui/page";
import type { Metadata } from "next";
import Link from "next/link";
import {
  allAnswers,
  answersForCountry,
  countries,
  countryUrl,
  GUIDE_BASE_URL,
  guideHeading,
  guideTitle,
  guideUrl,
  SITE_URL,
} from "@/lib/country-guides-data";
import { JsonLd } from "@/components/letterhead";
import { GuidePicker } from "./guide-picker";
import { Eyebrow, hairline } from "./guide-ui";

const title = "Country-specific getting started guides";
const description =
  "Answer three questions — one company or many, where they are registered, which way documents flow — and get the Peppol integration guide for exactly that situation. Belgium, France, the Netherlands and beyond.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: GUIDE_BASE_URL },
  openGraph: { title, description, url: GUIDE_BASE_URL, type: "website" },
};

export default function GettingStartedIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${SITE_URL}${GUIDE_BASE_URL}`,
    hasPart: allAnswers().map((answers) => ({
      "@type": "TechArticle",
      headline: guideHeading(answers),
      url: `${SITE_URL}${guideUrl(answers)}`,
    })),
  };

  return (
    <DocsPage full>
      <JsonLd data={jsonLd} />

      <header className="pt-4 pb-8">
        <Eyebrow>Recommand · Getting started</Eyebrow>
        <h1 className="display mt-5 max-w-3xl text-4xl text-fd-foreground sm:text-5xl">
          Getting started, tailored to you
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
          Putting a company on Peppol takes different steps depending on whether
          you are setting up one company or onboarding many, where they are
          registered, and which way the documents flow.
        </p>
      </header>

      <GuidePicker />

      <section className="pt-10">
        <span className="eyebrow text-fd-muted-foreground">By country</span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((country) => (
            <Link
              key={country.id}
              href={countryUrl(country)}
              className={`rounded-xl border p-4 no-underline transition-colors ${hairline} hover:border-folder-dark/40 dark:hover:border-folder/40`}
            >
              <span className="text-xl" aria-hidden="true">
                {country.flag}
              </span>
              <span className="mt-1 block font-semibold text-fd-foreground">
                {country.label}
              </span>
              <span className="mt-1 block text-sm leading-snug text-fd-muted-foreground">
                {country.hint}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/*
        Every combination, spelled out. It is collapsed because the picker above
        is the way a person gets here, but the links are in the HTML either way,
        so each guide is reachable in one hop from this page.
      */}
      <details className={`mt-10 border-t pt-6 ${hairline}`}>
        <summary className="cursor-pointer text-sm text-fd-muted-foreground marker:text-folder">
          All {allAnswers().length} guides
        </summary>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((country) => (
            <div key={country.id}>
              <span className="eyebrow text-stone-dark dark:text-stone">
                {country.label}
              </span>
              <ul className="mt-2 space-y-1.5 text-sm">
                {answersForCountry(country).map((answers) => (
                  <li key={guideUrl(answers)}>
                    <Link
                      href={guideUrl(answers)}
                      className="text-fd-muted-foreground no-underline transition-colors hover:text-folder-dark dark:hover:text-folder"
                    >
                      {guideTitle(answers)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </DocsPage>
  );
}

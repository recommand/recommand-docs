import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsPage } from "fumadocs-ui/page";
import {
  answersForCountry,
  countries,
  countryUrl,
  findCountry,
  GUIDE_BASE_URL,
  guideDescription,
  guideHeading,
  guideUrl,
  SITE_URL,
  type Country,
} from "@/lib/country-guides-data";
import { JsonLd } from "@/components/letterhead";
import { GuidePicker } from "../guide-picker";
import { Breadcrumbs, Eyebrow, hairline } from "../guide-ui";

type PageParams = { country: string };

function pageTitle(country: Country): string {
  return `Peppol e-invoicing in ${country.prose}`;
}

function pageDescription(country: Country): string {
  return `How to put a ${country.company} on the Peppol network with Recommand: identifiers, verification, document formats, sending and receiving. ${country.hint}`;
}

export default async function CountryIndex(props: {
  params: Promise<PageParams>;
}) {
  const params = await props.params;
  const country = findCountry(params.country);
  if (!country) notFound();

  const trail = [
    { href: GUIDE_BASE_URL, label: "Getting started" },
    { label: country.label },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: pageTitle(country),
        description: pageDescription(country),
        url: `${SITE_URL}${countryUrl(country)}`,
        hasPart: answersForCountry(country).map((answers) => ({
          "@type": "TechArticle",
          headline: guideHeading(answers),
          url: `${SITE_URL}${guideUrl(answers)}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.label,
          ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
        })),
      },
    ],
  };

  const others = countries.filter((candidate) => candidate.id !== country.id);

  return (
    <DocsPage full>
      <JsonLd data={jsonLd} />

      <Breadcrumbs trail={trail} />

      <header className="pt-4 pb-8">
        <Eyebrow>
          Recommand · Getting started {country.flag} {country.label}
        </Eyebrow>
        <h1 className="display mt-5 text-4xl text-fd-foreground sm:text-5xl">
          {pageTitle(country)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
          {country.hint} Answer the two remaining questions to get the guide for
          your situation.
        </p>
      </header>

      <GuidePicker initial={{ country: country.id }} />

      <section className="pt-10">
        <span className="eyebrow text-fd-muted-foreground">
          All {answersForCountry(country).length} guides for {country.prose}
        </span>
        <div className={`mt-5 border-t ${hairline}`}>
          {answersForCountry(country).map((answers) => (
            <Link
              key={guideUrl(answers)}
              href={guideUrl(answers)}
              className={`group flex items-start gap-4 border-b py-4 no-underline ${hairline}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                  {guideHeading(answers)}
                </span>
                <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-fd-muted-foreground">
                  {guideDescription(answers)}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1.5 size-4 shrink-0 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className={`mt-10 border-t pt-6 ${hairline}`}>
        <span className="eyebrow text-fd-muted-foreground">Other countries</span>
        <p className="mt-3 leading-relaxed text-fd-muted-foreground">
          {others.map((other, index) => (
            <span key={other.id}>
              {index > 0 && " · "}
              <Link href={countryUrl(other)}>
                Peppol e-invoicing in {other.prose}
              </Link>
            </span>
          ))}
        </p>
      </section>
    </DocsPage>
  );
}

export function generateStaticParams(): PageParams[] {
  return countries.map((country) => ({ country: country.id }));
}

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const country = findCountry(params.country);
  if (!country) return {};

  const title = pageTitle(country);
  const description = pageDescription(country);
  return {
    title,
    description,
    alternates: { canonical: countryUrl(country) },
    openGraph: {
      title,
      description,
      url: countryUrl(country),
      type: "website",
    },
  };
}

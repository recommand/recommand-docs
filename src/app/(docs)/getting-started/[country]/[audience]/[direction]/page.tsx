import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import { PageActions } from "@/components/page-actions";
import {
  allAnswers,
  answersForCountry,
  countryUrl,
  GUIDE_BASE_URL,
  guideChain,
  guideDescription,
  guideHeading,
  guideIntro,
  guideTitle,
  guideUrl,
  resolveAnswers,
  SITE_URL,
} from "@/lib/country-guides";
import { JsonLd } from "@/components/letterhead";
import { GuideSelector } from "../../../guide-selector";
import { Breadcrumbs, hairline } from "../../../guide-ui";

type PageParams = {
  country: string;
  audience: string;
  direction: string;
};

export default async function Page(props: { params: Promise<PageParams> }) {
  const params = await props.params;
  const answers = resolveAnswers(params);
  if (!answers) notFound();

  const { country, audience, direction } = answers;
  const url = guideUrl(answers);
  const chain = guideChain(answers);
  const toc = chain.flatMap((fragment) => fragment.toc);

  const trail = [
    { href: GUIDE_BASE_URL, label: "Getting started" },
    { href: countryUrl(country), label: country.label },
    { label: `${audience.label} · ${direction.label}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${SITE_URL}${url}#article`,
        headline: guideHeading(answers),
        description: guideDescription(answers),
        url: `${SITE_URL}${url}`,
        inLanguage: "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Recommand Docs",
          url: SITE_URL,
        },
        about: [
          "Peppol",
          "Electronic invoicing",
          `E-invoicing in ${country.prose}`,
        ],
        audience: {
          "@type": "Audience",
          audienceType: audience.plural,
          geographicArea: {
            "@type": "Country",
            name: country.label,
          },
        },
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

  /* The other five guides for this country: extra crawlable, human-useful links. */
  const siblings = answersForCountry(country).filter(
    (candidate) =>
      candidate.audience.id !== audience.id ||
      candidate.direction.id !== direction.id,
  );

  return (
    <DocsPage toc={toc}>
      <JsonLd data={jsonLd} />

      <Breadcrumbs trail={trail} />
      <DocsTitle className="display mt-3 font-normal text-3xl sm:text-4xl">
        {guideHeading(answers)}
      </DocsTitle>
      <DocsDescription>{guideDescription(answers)}</DocsDescription>
      <div className={`flex flex-row items-center gap-2 border-b pt-2 pb-6 ${hairline}`}>
        <PageActions markdownUrl={`${url}.md`} />
      </div>

      <div className="pt-6">
        <GuideSelector answers={answers} />
      </div>

      <DocsBody>
        <p>{guideIntro(answers)}</p>
        {chain.map((fragment) => {
          const MDX = fragment.body;
          return <MDX key={fragment.info.path} components={getMDXComponents()} />;
        })}

        <h2 id="other-guides-for-this-country">
          Other guides for {country.prose}
        </h2>
        <ul>
          {siblings.map((sibling) => (
            <li key={guideUrl(sibling)}>
              <a href={guideUrl(sibling)}>{guideHeading(sibling)}</a>
            </li>
          ))}
        </ul>
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams(): PageParams[] {
  return allAnswers().map((answers) => ({
    country: answers.country.id,
    audience: answers.audience.id,
    direction: answers.direction.id,
  }));
}

export async function generateMetadata(props: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const answers = resolveAnswers(params);
  if (!answers) return {};

  const url = guideUrl(answers);
  const title = guideTitle(answers);
  const description = guideDescription(answers);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: { title, description },
  };
}

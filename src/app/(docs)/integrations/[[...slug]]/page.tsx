import { integrationsSource } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/* Hairline rule, letterhead style: ink on light, sheet on dark */
const hairline = "border-darkslate/10 dark:border-sheet/15";

/* Logo lookup by frontmatter `icon` id (assets in public/integrations/) */
const integrationLogos: Record<string, string> = {
  harvest: "/integrations/harvest.png",
  "business-central": "/integrations/business-central.svg",
  erpnext: "/integrations/erpnext.png",
  exact: "/integrations/exact.png",
  yuki: "/integrations/yuki.png",
  clearfacts: "/integrations/clearfacts.png",
};

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-2.5 text-folder-dark dark:text-folder">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-[2px] bg-folder"
      />
      {children}
    </div>
  );
}

function LogoChip({ src, size }: { src: string; size: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg border border-shadow/60 bg-sheet-light dark:border-sheet/15 ${
        size >= 24 ? "size-11" : "size-10"
      }`}
    >
      <img src={src} alt="" width={size} height={size} />
    </span>
  );
}

/** Integration guides in sidebar (meta.json) order, index page excluded. */
function getIntegrationPages() {
  const pages = integrationsSource
    .getPages()
    .filter((page) => page.slugs.length > 0);
  const byUrl = new Map(pages.map((page) => [page.url, page] as const));
  const ordered = [];
  for (const node of integrationsSource.pageTree.children) {
    if (node.type !== "page") continue;
    const page = byUrl.get(node.url);
    if (page) ordered.push(page);
  }
  return ordered.length > 0 ? ordered : pages;
}

/** "Microsoft Business Central Integration" → "Microsoft Business Central" */
function integrationName(title: string) {
  return title.replace(/\s+Integration$/i, "");
}

function IntegrationsIndex({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const pages = getIntegrationPages();

  return (
    <div className="w-full">
      {/* Letterhead */}
      <header
        className={`grain relative w-full overflow-hidden border-b ${hairline}`}
      >
        <div
          aria-hidden="true"
          className="absolute -top-20 right-[8%] h-48 w-40 rotate-12 rounded-[2.5rem] bg-folder/15 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-4xl px-6 pt-12 pb-10 md:pt-16">
          <div className="grid items-end gap-x-16 gap-y-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Recommand · Peppol API</Eyebrow>
              <h1 className="display mt-4 text-4xl text-fd-foreground sm:text-5xl">
                {title}
              </h1>
            </div>
            {description && (
              <p className="max-w-md leading-relaxed text-fd-muted-foreground lg:justify-self-end lg:pb-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Ruled link rows */}
      <section className="mx-auto w-full max-w-4xl px-6 py-10 md:py-12">
        <span className="eyebrow text-fd-muted-foreground">Setup guides</span>
        <div className="mt-4">
          {pages.map((page, i) => {
            const logo = page.data.icon
              ? integrationLogos[page.data.icon]
              : undefined;
            return (
              <Link
                key={page.url}
                href={page.url}
                className={`group flex items-center gap-5 border-b py-5 ${hairline} ${
                  i === 0 ? "border-t" : ""
                }`}
              >
                <span className="font-mono text-xs tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {logo && <LogoChip src={logo} size={22} />}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                    {integrationName(page.data.title)}
                  </h2>
                  {page.data.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-fd-muted-foreground">
                      {page.data.description}
                    </p>
                  )}
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                />
              </Link>
            );
          })}
        </div>

        {/* Looking for more: paper note */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-xl border bg-paper/40 px-6 py-5 dark:bg-slate/20 ${hairline}`}
        >
          <div className="min-w-0">
            <h2 className="font-semibold text-fd-foreground">
              Looking for more?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
              Browse all available and upcoming integrations, and vote for the
              ones you'd like to see next.
            </p>
          </div>
          <a
            href="https://recommand.eu/integrations"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-folder-dark transition-colors hover:text-darkslate dark:text-folder dark:hover:text-sheet"
          >
            All integrations
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </section>
    </div>
  );
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = integrationsSource.getPage(params.slug);
  if (!page) notFound();

  // Section index: letterhead + ruled rows instead of a plain docs page.
  if (!params.slug || params.slug.length === 0) {
    return (
      <IntegrationsIndex
        title={page.data.title}
        description={page.data.description}
      />
    );
  }

  const MDX = page.data.body;
  const logo = page.data.icon ? integrationLogos[page.data.icon] : undefined;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {/* Letterhead-style guide header */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <Eyebrow>Integration guide</Eyebrow>
          <DocsTitle className="display mt-4 font-normal text-3xl sm:text-4xl">
            {page.data.title}
          </DocsTitle>
        </div>
        {logo && (
          <span aria-hidden="true" className="mt-1 hidden sm:block">
            <LogoChip src={logo} size={24} />
          </span>
        )}
      </div>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className={`border-b pb-2 ${hairline}`} />
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return integrationsSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = integrationsSource.getPage(params.slug);
  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

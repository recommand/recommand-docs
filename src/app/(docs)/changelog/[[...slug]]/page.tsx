import { changelogSource } from "@/lib/source";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import { PageActions } from "@/components/page-actions";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Rss } from "lucide-react";
import type { ReactNode } from "react";

/* Hairline rule, letterhead style: ink on light, sheet on dark */
const hairline = "border-darkslate/10 dark:border-sheet/15";

type ChangelogEntry = {
  title: string;
  description?: string;
  url: string;
  date: string | null;
};

type MonthGroup = {
  key: string;
  label: string;
  entries: ChangelogEntry[];
};

function toIsoDate(date: unknown): string | null {
  if (!date) return null;
  const parsed = new Date(date as string | number | Date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function groupByMonth(
  pages: ReturnType<typeof changelogSource.getPages>
): MonthGroup[] {
  const sorted = [...pages].sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  const groups = new Map<string, MonthGroup>();

  for (const page of sorted) {
    const iso = toIsoDate(page.data.date);
    const key = iso ? iso.slice(0, 7) : "undated";
    const label = iso
      ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : "Undated";

    let group = groups.get(key);
    if (!group) {
      group = { key, label, entries: [] };
      groups.set(key, group);
    }

    group.entries.push({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      date: iso,
    });
  }

  return [...groups.values()];
}

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

function ChangelogIndex() {
  const groups = groupByMonth(changelogSource.getPages());

  return (
    <DocsPage full>
      {/* Letterhead */}
      <header className={`border-b pt-4 pb-10 ${hairline}`}>
        <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Recommand · Release journal</Eyebrow>
            <h1 className="display mt-5 text-5xl text-fd-foreground sm:text-6xl">
              Changelog
            </h1>
          </div>
          <div className="max-w-md lg:justify-self-end lg:pb-2">
            <p className="text-lg leading-relaxed text-fd-muted-foreground">
              New endpoints, features and fixes across the Recommand Peppol
              API, recorded as they ship.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href="/rss/changelog.xml"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-folder-dark transition-colors hover:text-darkslate dark:text-folder dark:hover:text-sheet"
              >
                <Rss aria-hidden="true" className="size-3.5" />
                RSS feed
              </a>
              <a
                href="https://discord.gg/a2tcQYA3ew"
                className="group inline-flex items-center gap-1 text-sm font-medium text-folder-dark transition-colors hover:text-darkslate dark:text-folder dark:hover:text-sheet"
              >
                Discord announcements
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Chronological ledger, grouped by month */}
      <div className="flex flex-col gap-14 py-8 md:py-10">
        {groups.map((group) => (
          <section
            key={group.key}
            className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10"
          >
            <h2 className="eyebrow text-stone-dark md:sticky md:top-20 md:self-start dark:text-stone">
              {group.label}
            </h2>
            <div className={`border-t ${hairline}`}>
              {group.entries.map((entry) => (
                <Link
                  key={entry.url}
                  href={entry.url}
                  className={`group flex items-baseline gap-5 border-b py-5 no-underline sm:gap-8 ${hairline}`}
                >
                  <span className="w-20 shrink-0 font-mono text-xs tabular-nums text-fd-muted-foreground transition-colors group-hover:text-folder-dark sm:w-24 dark:group-hover:text-folder">
                    {entry.date ?? "—"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                      {entry.title}
                    </span>
                    {entry.description && (
                      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-fd-muted-foreground">
                        {entry.description}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 self-center text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </DocsPage>
  );
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  if (!params.slug) {
    return <ChangelogIndex />;
  }

  const page = changelogSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const isoDate = toIsoDate(page.data.date);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {/* Journal-entry letterhead */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/changelog"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground no-underline transition-colors hover:text-folder-dark dark:hover:text-folder"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          Changelog
        </Link>
        <a
          href="/rss/changelog.xml"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-fd-muted-foreground transition-colors hover:text-folder-dark dark:hover:text-folder"
        >
          <Rss aria-hidden="true" className="size-3" />
          RSS
        </a>
      </div>
      <header className={`border-b pt-2 pb-6 ${hairline}`}>
        {isoDate && (
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-[2px] bg-folder"
            />
            <time
              dateTime={isoDate}
              className="font-mono text-xs tabular-nums text-stone-dark dark:text-stone"
            >
              {isoDate}
            </time>
          </div>
        )}
        <h1 className="display mt-4 text-4xl text-fd-foreground sm:text-5xl">
          {page.data.title}
        </h1>
        {page.data.description && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
            {page.data.description}
          </p>
        )}
        <div className="flex flex-row items-center gap-2 pt-6">
          <PageActions markdownUrl={`${page.url}.md`} />
        </div>
      </header>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return changelogSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  if (!params.slug) {
    return {
      title: "Changelog",
      description:
        "New endpoints, features and fixes across the Recommand Peppol API, recorded as they ship.",
      alternates: {
        types: {
          "application/rss+xml": [
            {
              title: "Recommand Peppol API Changelog",
              url: "/rss/changelog.xml",
            },
          ],
        },
      },
    };
  }
  const page = changelogSource.getPage(params.slug);
  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

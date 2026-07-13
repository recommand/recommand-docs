import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Code2,
  HelpCircle,
  History,
  Inbox,
  KeyRound,
  Puzzle,
  Send,
} from "lucide-react";
import { SearchTrigger } from "@/components/search-trigger";
import { changelogSource } from "@/lib/source";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Peppol API Documentation",
  description:
    "Everything you need to send and receive documents over the Peppol network. Explore guides, API references, and examples to integrate in minutes.",
};

/* Hairline rule, letterhead style: ink on light, sheet on dark */
const hairline = "border-darkslate/10 dark:border-sheet/15";

const quickStartGuides = [
  {
    title: "Authentication",
    href: "/docs/authentication",
    icon: KeyRound,
  },
  {
    title: "Managing Companies",
    href: "/docs/managing-companies",
    icon: Building2,
  },
  {
    title: "Sending Invoices",
    href: "/docs/sending-invoices",
    icon: Send,
  },
  {
    title: "Receiving Documents",
    href: "/docs/receiving-documents",
    icon: Inbox,
  },
];

const entryPoints = [
  {
    title: "Documentation",
    description: "Guides and tutorials for the Recommand Peppol API.",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "API Reference",
    description: "Complete endpoint reference generated from the OpenAPI spec.",
    href: "/reference",
    icon: Code2,
  },
  {
    title: "Integrations",
    description: "Connect Recommand with your existing tools and workflows.",
    href: "/integrations",
    icon: Puzzle,
  },
  {
    title: "Changelog",
    description: "Track the latest changes, features, and fixes.",
    href: "/changelog",
    icon: History,
  },
  {
    title: "FAQ",
    description: "Frequently asked questions about the Recommand Peppol API.",
    href: "/faq",
    icon: HelpCircle,
  },
];

function getLatestChangelog() {
  const pages = changelogSource.getPages();
  return [...pages]
    .sort((a, b) => {
      const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
      const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3)
    .map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      date: page.data.date
        ? new Date(page.data.date).toISOString().slice(0, 10)
        : null,
    }));
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

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-folder-dark transition-colors hover:text-darkslate dark:text-folder dark:hover:text-sheet"
    >
      {children}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

export default function HomePage() {
  const latestChanges = getLatestChangelog();

  return (
    <>
      {/* Letterhead hero */}
      <header
        className={`grain relative w-full overflow-hidden border-b ${hairline}`}
      >
        <style>{`
@keyframes shard-drift{0%,100%{transform:translate3d(0,0,0)}33%{transform:translate3d(6px,-10px,0)}66%{transform:translate3d(-5px,6px,0)}}
.shard-drift{animation:shard-drift 14s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.shard-drift{animation:none}}
        `}</style>
        <div
          aria-hidden="true"
          className="shard-drift absolute -top-24 right-[6%] h-64 w-52 rotate-12 rounded-[2.5rem] bg-folder/15 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-16 pb-12 md:pt-20">
          <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Recommand · Peppol API</Eyebrow>
              <h1 className="display mt-5 text-5xl text-fd-foreground sm:text-6xl lg:text-7xl">
                Documentation
              </h1>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-fd-muted-foreground lg:justify-self-end lg:pb-2">
              Everything you need to send and receive documents over the Peppol
              network. Explore guides, API references, and examples to
              integrate in minutes.
            </p>
          </div>

          <div className="mt-10 max-w-xl">
            <SearchTrigger />
          </div>

          {/* Quick start: ruled rows */}
          <div className="mt-14">
            <div className="flex items-baseline justify-between pb-4">
              <span className="eyebrow text-fd-muted-foreground">
                Quick start
              </span>
              <ArrowLink href="/docs">View all guides</ArrowLink>
            </div>
            <div className="grid gap-x-14 sm:grid-cols-2">
              {quickStartGuides.map((guide, i) => {
                const Icon = guide.icon;
                return (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className={`group flex items-center gap-4 border-t py-4 ${hairline}`}
                  >
                    <span className="font-mono text-xs tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-fd-muted-foreground"
                    />
                    <span className="text-sm font-medium text-fd-foreground">
                      {guide.title}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="ml-auto size-4 text-fd-muted-foreground/60 transition-all group-hover:translate-x-1 group-hover:text-folder-dark dark:group-hover:text-folder"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Entry points: ruled link rows */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        <Eyebrow>Browse</Eyebrow>
        <h2 className="display mt-4 text-3xl text-fd-foreground sm:text-4xl">
          Find your way in
        </h2>
        <div className="mt-8 grid gap-x-14 md:grid-cols-2">
          {entryPoints.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`group flex items-start justify-between gap-6 border-b py-6 ${hairline}`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-fd-muted-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest updates: paper band with mono-dated hairline rows */}
      <section
        className={`w-full border-t bg-paper/40 dark:bg-slate/20 ${hairline}`}
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Changelog</Eyebrow>
              <h2 className="display mt-4 text-3xl text-fd-foreground sm:text-4xl">
                Latest updates
              </h2>
            </div>
            <ArrowLink href="/changelog">Full changelog</ArrowLink>
          </div>
          <div className="mt-8">
            {latestChanges.map((entry) => (
              <Link
                key={entry.url}
                href={entry.url}
                className={`group flex items-baseline gap-6 border-b py-5 no-underline ${hairline}`}
              >
                {entry.date && (
                  <span className="shrink-0 font-mono text-xs tabular-nums text-fd-muted-foreground">
                    {entry.date}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                    {entry.title}
                  </h3>
                  {entry.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-fd-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 self-center text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

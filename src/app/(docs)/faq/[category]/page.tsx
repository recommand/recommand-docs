import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getCategoryItems, getCategoryLabel } from "@/lib/faq";
import { BackLink, Eyebrow, hairline } from "../faq-ui";

export function generateStaticParams() {
  return getCategories().map((category) => ({ category }));
}

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await props.params;
  const items = getCategoryItems(category);
  const label = items ? getCategoryLabel(category, items) : category;
  return {
    title: `FAQ - ${label}`,
    description: `Frequently asked questions about ${label}.`,
  };
}

export default async function FaqCategoryPage(props: { params: Promise<{ category: string }> }) {
  const { category } = await props.params;
  const items = getCategoryItems(category);
  if (!items) notFound();

  const label = getCategoryLabel(category, items);

  return (
    <>
      {/* Letterhead */}
      <header className={`grain relative w-full overflow-hidden border-b ${hairline}`}>
        <div
          aria-hidden="true"
          className="absolute -top-24 right-[8%] h-56 w-48 rotate-12 rounded-[2.5rem] bg-folder/15 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-10 pb-10 md:pt-12">
          <BackLink href="/faq">All questions</BackLink>
          <div className="mt-8 grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h1 className="display mt-4 text-4xl text-fd-foreground sm:text-5xl">{label}</h1>
            </div>
            <div className="lg:justify-self-end lg:pb-1">
              <p className="max-w-md text-lg leading-relaxed text-fd-muted-foreground">
                Frequently asked questions about {label.toLowerCase()}.
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-wide text-stone-dark dark:text-stone">
                {items.length} {items.length === 1 ? "question" : "questions"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Questions as ruled rows */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 md:py-14">
        <div className={`border-t ${hairline}`}>
          {items.map((q, i) => (
            <Link
              key={q.slug}
              href={q.url}
              className={`group flex items-start gap-4 border-b py-5 no-underline sm:gap-6 ${hairline}`}
            >
              <span className="pt-0.5 font-mono text-sm tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                  {q.title}
                </span>
                {q.excerpt && (
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-fd-muted-foreground">
                    {q.excerpt}
                  </span>
                )}
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
              />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

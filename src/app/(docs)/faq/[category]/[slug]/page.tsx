import { DocsBody } from "fumadocs-ui/page";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import { getCategoryItems, getCategoryLabel } from "@/lib/faq";
import { faqSource } from "@/lib/source";
import { BackLink, Eyebrow, hairline } from "../../faq-ui";

export function generateStaticParams() {
  return faqSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await props.params;
  const page = faqSource.getPage([category, slug]);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.excerpt || page.data.description,
  };
}

export default async function FaqQuestionPage(props: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await props.params;
  const page = faqSource.getPage([category, slug]);
  if (!page) notFound();

  const items = getCategoryItems(category);
  const categoryLabel = page.data.category || getCategoryLabel(category, items || undefined);
  const related = (items || []).filter((q) => q.slug !== slug).slice(0, 5);
  const updatedAt = page.data.updatedAt
    ? new Date(page.data.updatedAt).toISOString().slice(0, 10)
    : null;

  const MDX = page.data.body;

  return (
    <>
      {/* Letterhead */}
      <header className={`grain relative w-full border-b ${hairline}`}>
        <div className="relative mx-auto w-full max-w-3xl px-6 pt-10 pb-9 md:pt-12">
          <BackLink href={`/faq/${encodeURIComponent(category)}`}>{categoryLabel}</BackLink>
          <div className="mt-8">
            <Eyebrow>FAQ · {categoryLabel}</Eyebrow>
            <h1 className="display mt-4 text-3xl text-fd-foreground sm:text-4xl">
              {page.data.title}
            </h1>
            {page.data.excerpt && (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fd-muted-foreground">
                {page.data.excerpt}
              </p>
            )}
            {updatedAt && (
              <p className="mt-4 font-mono text-xs uppercase tracking-wide text-stone-dark dark:text-stone">
                Updated {updatedAt}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Answer at a readable measure */}
      <article className="mx-auto w-full max-w-3xl px-6 py-10 md:py-12">
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>

        {related.length > 0 && (
          <section className="mt-14">
            <span className="eyebrow text-fd-muted-foreground">Related questions</span>
            <div className={`mt-4 border-t ${hairline}`}>
              {related.map((q, i) => (
                <Link
                  key={q.slug}
                  href={q.url}
                  className={`group flex items-baseline gap-4 border-b py-4 no-underline ${hairline}`}
                >
                  <span className="font-mono text-xs tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                    {q.title}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 self-center text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

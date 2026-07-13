import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFaq, getCategoryLabel } from "@/lib/faq";
import { Eyebrow, hairline } from "./faq-ui";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Recommand and Peppol.",
};

export default function FaqIndex() {
  const data = getAllFaq();
  // Source order follows content/faq/meta.json (editorial), not alphabetical.
  const categories = Object.keys(data);
  const totalQuestions = categories.reduce((sum, cat) => sum + data[cat].length, 0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Object.values(data)
      .flat()
      .map((item) => ({
        "@type": "Question",
        name: item.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.excerpt || "",
        },
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Letterhead */}
      <header className={`grain relative w-full overflow-hidden border-b ${hairline}`}>
        <div
          aria-hidden="true"
          className="absolute -top-24 right-[8%] h-56 w-48 rotate-12 rounded-[2.5rem] bg-folder/15 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-16 pb-12 md:pt-20">
          <div className="grid items-end gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <Eyebrow>Recommand · Support</Eyebrow>
              <h1 className="display mt-5 text-5xl text-fd-foreground sm:text-6xl">
                Frequently asked questions
              </h1>
            </div>
            <div className="lg:justify-self-end lg:pb-2">
              <p className="max-w-md text-lg leading-relaxed text-fd-muted-foreground">
                Straight answers about Peppol, e-invoicing and the Recommand API, sorted by topic.
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-wide text-stone-dark dark:text-stone">
                {totalQuestions} questions · {categories.length} topics
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Topics as ruled link rows */}
      <section className="mx-auto w-full max-w-5xl px-6 py-14 md:py-16">
        <span className="eyebrow text-fd-muted-foreground">Browse by topic</span>
        <div className={`mt-5 border-t ${hairline}`}>
          {categories.map((cat, i) => {
            const items = data[cat];
            const label = getCategoryLabel(cat, items);
            const preview = items
              .slice(0, 2)
              .map((q) => q.title)
              .join("  ·  ");
            return (
              <Link
                key={cat}
                href={`/faq/${encodeURIComponent(cat)}`}
                className={`group flex items-start gap-4 border-b py-5 no-underline sm:gap-6 ${hairline}`}
              >
                <span className="pt-1 font-mono text-sm tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark sm:text-xl dark:group-hover:text-folder">
                    {label}
                  </span>
                  <span className="mt-1 line-clamp-1 block text-sm text-fd-muted-foreground">
                    {preview}
                  </span>
                </span>
                <span className="hidden shrink-0 pt-1.5 font-mono text-xs tabular-nums text-fd-muted-foreground sm:inline">
                  {items.length} {items.length === 1 ? "question" : "questions"}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-1.5 size-4 shrink-0 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

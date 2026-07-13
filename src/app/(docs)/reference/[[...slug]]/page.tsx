import { referenceSource } from "@/lib/source";
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
import type { Item, Node } from "fumadocs-core/page-tree";
import type { ReactNode } from "react";

/* Hairline rule, letterhead style: ink on light, sheet on dark */
const hairline = "border-darkslate/10 dark:border-sheet/15";

/*
 * Short descriptions per endpoint group, keyed by the group's URL segment.
 * Mirrors `tagDescriptions` in scripts/generate-openapi.mts; groups without
 * an entry simply render title + endpoint count.
 */
const groupDescriptions: Record<string, string> = {
  authentication: "Verify authentication and manage API credentials.",
  sending: "Send Peppol documents such as invoices and credit notes.",
  recipients: "Verify recipient presence on the Peppol network.",
  documents: "Retrieve, list, and manage sent and received documents.",
  companies: "Create and manage company profiles.",
  "company-identifiers": "Manage Peppol identifiers for your companies.",
  "company-document-types": "Configure supported document types per company.",
  "company-notification-email-addresses":
    "Manage notification email addresses for companies.",
  playgrounds: "Create and manage sandbox environments for testing.",
  labels: "Organize documents with labels.",
  suppliers: "Manage supplier records.",
  customers: "Manage customer records.",
  webhooks: "Configure webhook endpoints for real-time event notifications.",
  models: "Data models shared across requests and responses.",
};

interface EndpointGroup {
  key: string;
  name: ReactNode;
  href: string;
  slug: string;
  count: number;
}

function findFirstPage(nodes: Node[]): Item | undefined {
  for (const node of nodes) {
    if (node.type === "page") return node;
    if (node.type === "folder") {
      const found = node.index ?? findFirstPage(node.children);
      if (found) return found;
    }
  }
  return undefined;
}

function countPages(nodes: Node[]): number {
  let total = 0;
  for (const node of nodes) {
    if (node.type === "page") total += 1;
    else if (node.type === "folder")
      total += (node.index ? 1 : 0) + countPages(node.children);
  }
  return total;
}

function getEndpointGroups(): EndpointGroup[] {
  const groups: EndpointGroup[] = [];
  for (const node of referenceSource.pageTree.children) {
    if (node.type !== "folder") continue;
    const first = node.index ?? findFirstPage(node.children);
    if (!first) continue;
    const slug = first.url.split("/")[2] ?? "";
    groups.push({
      key: node.$id ?? first.url,
      name: node.name,
      href: first.url,
      slug,
      count: (node.index ? 1 : 0) + countPages(node.children),
    });
  }
  return groups;
}

function ReferenceIndex({ description }: { description?: string }) {
  const groups = getEndpointGroups();

  return (
    <DocsPage
      full
      breadcrumb={{ enabled: false }}
      tableOfContent={{ enabled: false }}
      tableOfContentPopover={{ enabled: false }}
    >
      {/* Letterhead */}
      <header className={`border-b pb-10 ${hairline}`}>
        <div className="eyebrow flex items-center gap-2.5 text-folder-dark dark:text-folder">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-[2px] bg-folder"
          />
          Recommand · Peppol API
        </div>
        <div className="mt-5 grid items-end gap-x-16 gap-y-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <h1 className="display text-4xl text-fd-foreground sm:text-5xl">
            API Reference
          </h1>
          {description && (
            <p className="max-w-md text-base leading-relaxed text-fd-muted-foreground lg:justify-self-end lg:pb-1">
              {description}
            </p>
          )}
        </div>
      </header>

      {/* Endpoint groups: ruled link rows */}
      <section className="mt-2">
        <div className="flex items-baseline justify-between pb-4">
          <span className="eyebrow text-fd-muted-foreground">
            Endpoint groups
          </span>
          <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
            {String(groups.length).padStart(2, "0")} sections
          </span>
        </div>
        <div className="grid gap-x-14 md:grid-cols-2">
          {groups.map((group, i) => {
            const description = groupDescriptions[group.slug];
            const unit = group.slug === "models" ? "model" : "endpoint";
            return (
              <Link
                key={group.key}
                href={group.href}
                className={`group flex items-start justify-between gap-6 border-t py-5 ${hairline}`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="pt-0.5 font-mono text-xs tabular-nums text-stone transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-[0.9375rem] font-semibold text-fd-foreground transition-colors group-hover:text-folder-dark dark:group-hover:text-folder">
                      {group.name}
                    </h2>
                    {description && (
                      <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 pt-0.5">
                  <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
                    {group.count} {unit}
                    {group.count === 1 ? "" : "s"}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-fd-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-folder-dark dark:group-hover:text-folder"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </DocsPage>
  );
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = referenceSource.getPage(params.slug);
  if (!page) notFound();

  // Index route: replace the generated Cards body with the brand index.
  if (!params.slug || params.slug.length === 0) {
    return <ReferenceIndex description={page.data.description} />;
  }

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return referenceSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = referenceSource.getPage(params.slug);
  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

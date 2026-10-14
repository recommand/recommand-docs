import fs from "node:fs/promises";
import path from "node:path";
import {
  allAnswers,
  guideDescription,
  guideHeading,
  guideUrl,
} from "@/lib/country-guides";
import {
  changelogSource,
  docsSource,
  faqSource,
  referenceSource,
} from "@/lib/source";

export const revalidate = false;

const WHEN_TO_USE = `## When to use Recommand

Recommand is a certified Peppol Access Point and SMP with a REST API. Use it when you need to:

- Send or receive e-invoices, credit notes and other business documents over the Peppol network from your own software, as structured UBL (Peppol BIS 3 and national variants such as XRechnung and SI-UBL), CII or Factur-X.
- Register companies on Peppol and verify them: your own company, or the many companies you onboard from an accounting, ERP or vertical SaaS product. All companies sit under one team and one API key, and their volume is pooled.
- Check whether a recipient is reachable on Peppol before sending, with email delivery as a fallback for recipients who are not.
- Validate documents before they leave: every outgoing document is checked against the Peppol rules and the applicable national rules.
- Receive incoming documents through webhooks or by polling an inbox.
- Meet country e-invoicing rules with step-by-step guides for Belgium, France (including e-reporting through a French-accredited platform), Germany, the Netherlands and Norway.

Do not use Recommand to:

- Deliver invoices to private consumers: Peppol addresses businesses and public bodies.
- Replace your accounting or ERP system: Recommand is the exchange layer that connects to it.
- Reach countries that require a national clearance platform Recommand does not connect to. Check country coverage at https://recommand.eu/en/countries before integrating.

## Getting started

1. Sign up at https://app.recommand.eu. The free plan includes 25 documents per month with API and dashboard access.
2. Create a playground team to test without sending anything over the real Peppol network: [Getting started](/docs.mdx).
3. Authenticate with an API key and secret (Basic authentication), a JWT, or OAuth2 with a JWT assertion: [Authentication](/docs/authentication.mdx).
4. Generate a client from the OpenAPI specification at https://app.recommand.eu/openapi.

Product overview, pricing and company information: https://recommand.eu/llms.txt`;

export async function GET() {
  const lines: string[] = [];

  lines.push("# Recommand Documentation");
  lines.push("");
  lines.push(
    "> Recommand provides a Peppol API and documentation for building, testing, and integrating Peppol-based electronic document flows into your applications and workflows.",
  );
  lines.push("");
  lines.push(
    "This file is intended for large language models and tools. It lists the most relevant documentation pages in a compact, markdown-friendly format.",
  );
  lines.push(
    "Each link points to a markdown version of a documentation page that is suitable for use as LLM context. Every documentation URL also returns markdown when requested with `Accept: text/markdown`.",
  );
  lines.push("");
  lines.push(WHEN_TO_USE);
  lines.push("");

  lines.push("## Country-specific getting started guides");
  lines.push("");
  for (const answers of allAnswers()) {
    lines.push(
      `- [${guideHeading(answers)}](${guideUrl(answers)}.mdx): ${guideDescription(answers)}`,
    );
  }
  lines.push("");

  lines.push("## Guides");
  lines.push("");
  for (const page of docsSource.getPages()) {
    const title = page.data.title ?? page.url;
    const description = page.data.description;
    const suffix = description ? `: ${description}` : "";
    lines.push(`- [${title}](${page.url}.mdx)${suffix}`);
  }
  lines.push("");

  // API Reference — read generated index.md for endpoint links
  const refDir = path.join(process.cwd(), "content/reference-md");
  try {
    const indexMd = await fs.readFile(path.join(refDir, "index.md"), "utf-8");
    // Strip frontmatter and use the body directly
    const body = indexMd.replace(/^---[\s\S]*?---\s*/, "");
    lines.push(body.trim());
    lines.push("");
  } catch {
    lines.push("## API Reference");
    lines.push("");
    lines.push("- [OpenAPI Spec](https://app.recommand.eu/openapi)");
    lines.push("");
  }

  // Models — list all model pages from reference/models
  lines.push("## Models");
  lines.push("");
  for (const page of referenceSource.getPages()) {
    if (!page.url.startsWith("/reference/models/")) continue;
    const title = page.data.title ?? page.url;
    const description = page.data.description;
    const suffix = description ? `: ${description}` : "";
    lines.push(`- [${title}](${page.url}.mdx)${suffix}`);
  }
  lines.push("");

  lines.push("## Changelog");
  lines.push("");
  for (const page of changelogSource.getPages()) {
    const title = page.data.title ?? page.url;
    const description = page.data.description;
    const suffix = description ? `: ${description}` : "";
    lines.push(`- [${title}](${page.url}.mdx)${suffix}`);
  }
  lines.push("");

  lines.push("## FAQ");
  lines.push("");
  for (const page of faqSource.getPages()) {
    const title = page.data.title ?? page.url;
    const description = page.data.description;
    const suffix = description ? `: ${description}` : "";
    lines.push(`- [${title}](${page.url}.mdx)${suffix}`);
  }
  lines.push("");

  lines.push("## Optional");
  lines.push("");
  lines.push(
    "- [Full documentation](/llms-full.txt): Single-file markdown snapshot of all documentation pages. Use this when a larger context window is acceptable.",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Also served for `/` when the client asks for markdown.
      Vary: "Accept",
    },
  });
}

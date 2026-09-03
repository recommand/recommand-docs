import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

// Guide pages moved under /docs/ in the July 2026 redesign. External sites
// still link the old bare paths, so those need to keep resolving. Kept as an
// explicit list rather than a catch-all on /:slug, which would shadow
// /changelog, /faq, /guides, /integrations, /reference and /samples.
const legacyDocSlugs = [
  "authentication",
  "company-verification",
  "discounts-and-surcharges",
  "email-delivery-and-notifications",
  "financial-discounts",
  "managing-companies",
  "peppol-network-basics",
  "peppol-standards-and-compliance",
  "receiving-documents",
  "rules",
  "self-billing",
  "sending-credit-notes",
  "sending-invoices",
  "suppliers-and-labels",
  "troubleshooting-guide",
  "ubl-format-guide",
  "verifying-recipients",
  "working-with-webhooks",
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      "@/.source/*": "./.source/*",
    },
  },
  async redirects() {
    return [
      {
        source: "/api-reference",
        destination: "/reference",
        permanent: true,
      },
      // Pre-redesign guide URLs.
      ...legacyDocSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/docs/${slug}`,
        permanent: true,
      })),
      // The authentication guide was also renamed.
      {
        source: "/authentication-guide",
        destination: "/docs/authentication",
        permanent: true,
      },
      {
        source: "/docs/authentication-guide",
        destination: "/docs/authentication",
        permanent: true,
      },
      // The changelog moved out from under /docs/.
      {
        source: "/docs/changelog",
        destination: "/changelog",
        permanent: true,
      },
      {
        source: "/docs/changelog/:path*",
        destination: "/changelog/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/getting-started/:path*.md",
        destination: "/llms.mdx/getting-started/:path*",
      },
      {
        source: "/getting-started/:path*.mdx",
        destination: "/llms.mdx/getting-started/:path*",
      },
      {
        source: "/docs/:path*.md",
        destination: "/llms.mdx/docs/:path*",
      },
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
      {
        source: "/integrations/:path*.md",
        destination: "/llms.mdx/integrations/:path*",
      },
      {
        source: "/integrations/:path*.mdx",
        destination: "/llms.mdx/integrations/:path*",
      },
      {
        source: "/changelog/:path*.md",
        destination: "/llms.mdx/changelog/:path*",
      },
      {
        source: "/changelog/:path*.mdx",
        destination: "/llms.mdx/changelog/:path*",
      },
      {
        source: "/faq/:path*.md",
        destination: "/llms.mdx/faq/:path*",
      },
      {
        source: "/faq/:path*.mdx",
        destination: "/llms.mdx/faq/:path*",
      },
      {
        source: "/reference/:path*.md",
        destination: "/llms.mdx/reference/:path*",
      },
      {
        source: "/reference/:path*.mdx",
        destination: "/llms.mdx/reference/:path*",
      },
    ];
  },
};

const withMDX = createMDX();
export default withMDX(nextConfig);

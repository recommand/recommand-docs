import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

/**
 * Same shape as the changelog: DocsPage chrome (table of contents, prose width)
 * without a sidebar tree, since the guide's navigation is the selector at the
 * top of the page.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={{ name: "", children: [] }}
      nav={{ enabled: false }}
      sidebar={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}

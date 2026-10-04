import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { integrationsSource } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={integrationsSource.pageTree}
      nav={{ title: false }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}

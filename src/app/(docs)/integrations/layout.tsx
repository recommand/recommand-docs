import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { integrationsSource } from "@/lib/source";
import type { ReactNode } from "react";

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

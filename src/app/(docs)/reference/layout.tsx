import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { referenceSource } from "@/lib/source";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={referenceSource.pageTree}
      nav={{ title: false }}
      searchToggle={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}

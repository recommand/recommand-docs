import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { referenceSource } from "@/lib/source";

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

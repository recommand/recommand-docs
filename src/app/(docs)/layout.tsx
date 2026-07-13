import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions, chromeClassName } from "@/lib/layout.shared";
import { LayoutTransitionGuard } from "@/components/layout-transition-guard";
import type { ReactNode } from "react";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()} className={chromeClassName}>
      <LayoutTransitionGuard />
      {children}
    </HomeLayout>
  );
}

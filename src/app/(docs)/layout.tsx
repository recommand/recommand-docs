import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { LayoutTransitionGuard } from "@/components/layout-transition-guard";
import { baseOptions, chromeClassName } from "@/lib/layout.shared";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()} className={chromeClassName}>
      <LayoutTransitionGuard />
      {children}
    </HomeLayout>
  );
}

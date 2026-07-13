import { RootProvider } from "fumadocs-ui/provider/next";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions, searchOptions } from "@/lib/layout.shared";
import { LayoutTransitionGuard } from "@/components/layout-transition-guard";
import type { ReactNode } from "react";

/**
 * Brand polish for the fumadocs chrome (Recommand visual system):
 * hairline borders, mint active-item accents and eyebrow-style sidebar
 * section labels. Applied here via scoped CSS variables + descendant
 * selectors so globals.css stays untouched.
 */
const chromeClassName = [
  // Hairline chrome borders. The sidebar border color comes from an id rule
  // in fumadocs' shadcn.css, so we override its source variable.
  "[--sidebar-border:color-mix(in_oklab,var(--darkslate)_10%,transparent)]",
  "dark:[--sidebar-border:color-mix(in_oklab,var(--sheet)_15%,transparent)]",
  "[&_#nd-nav>div]:border-darkslate/10",
  "dark:[&_#nd-nav>div]:border-sheet/15",
  // Mint accent for active items: the sidebar and TOC derive active text,
  // tint and rail color from fd-primary, so remap it to folder green there.
  "[&_#nd-sidebar]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-sidebar]:[--color-fd-primary:var(--folder)]",
  "[&_#nd-sidebar-mobile]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-sidebar-mobile]:[--color-fd-primary:var(--folder)]",
  "[&_#nd-toc]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-toc]:[--color-fd-primary:var(--folder)]",
  // Active sidebar link gets a touch more weight
  "[&_#nd-sidebar_a[data-active=true]]:font-medium",
  "[&_#nd-sidebar-mobile_a[data-active=true]]:font-medium",
  // Sidebar section separators as quiet eyebrow labels
  "[&_#nd-sidebar_p]:text-[0.6875rem]",
  "[&_#nd-sidebar_p]:font-bold",
  "[&_#nd-sidebar_p]:uppercase",
  "[&_#nd-sidebar_p]:tracking-[0.14em]",
  "[&_#nd-sidebar_p]:text-stone-dark",
  "dark:[&_#nd-sidebar_p]:text-stone",
  "[&_#nd-sidebar-mobile_p]:text-[0.6875rem]",
  "[&_#nd-sidebar-mobile_p]:font-bold",
  "[&_#nd-sidebar-mobile_p]:uppercase",
  "[&_#nd-sidebar-mobile_p]:tracking-[0.14em]",
  "[&_#nd-sidebar-mobile_p]:text-stone-dark",
  "dark:[&_#nd-sidebar-mobile_p]:text-stone",
].join(" ");

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={searchOptions}
      theme={{
        enabled: true,
      }}
    >
      <HomeLayout {...baseOptions()} className={chromeClassName}>
        <LayoutTransitionGuard />
        {children}
      </HomeLayout>
    </RootProvider>
  );
}

import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { RootProviderProps } from "fumadocs-ui/provider/next";
import StructuredSearchDialog from "@/components/search-dialog";
import RecommandLogo from "@/components/recommand-logo";
import { BookOpen, Code2, History, HelpCircle, Puzzle } from "lucide-react";

export const searchOptions: RootProviderProps["search"] = {
  SearchDialog: StructuredSearchDialog,
};

/**
 * Brand polish for the fumadocs chrome (Recommand visual system): hairline
 * borders, mint active-item accents, eyebrow-style sidebar section labels and
 * a branded search pill. Shared by the home and docs layouts so the header is
 * identical everywhere; applied via scoped CSS variables + descendant
 * selectors so globals.css stays untouched.
 */
export const chromeClassName = [
  // Hairline chrome borders. The sidebar border color comes from an id rule
  // in fumadocs' shadcn.css, so we override its source variable.
  "[--sidebar-border:color-mix(in_oklab,var(--darkslate)_10%,transparent)]",
  "dark:[--sidebar-border:color-mix(in_oklab,var(--sheet)_15%,transparent)]",
  "[&_#nd-nav>div]:border-darkslate/10",
  "dark:[&_#nd-nav>div]:border-sheet/15",
  // Mint accent for active items: the navbar, sidebar and TOC derive active
  // text, tint and rail color from fd-primary, so remap it to folder green.
  "[&_#nd-nav]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-nav]:[--color-fd-primary:var(--folder)]",
  "[&_#nd-sidebar]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-sidebar]:[--color-fd-primary:var(--folder)]",
  "[&_#nd-sidebar-mobile]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-sidebar-mobile]:[--color-fd-primary:var(--folder)]",
  "[&_#nd-toc]:[--color-fd-primary:var(--folder-dark)]",
  "dark:[&_#nd-toc]:[--color-fd-primary:var(--folder)]",
  // Active nav link gets a touch more weight, like the sidebar
  "[&_#nd-nav_a[data-active=true]]:font-medium",
  "[&_#nd-sidebar_a[data-active=true]]:font-medium",
  "[&_#nd-sidebar-mobile_a[data-active=true]]:font-medium",
  // Navbar search pill on a hairline border
  "[&_[data-search-full]]:border-darkslate/10",
  "dark:[&_[data-search-full]]:border-sheet/15",
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

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <RecommandLogo className="h-7 w-auto" />,
    },
    githubUrl: "https://github.com/brbxai/recommand-peppol",
    links: [
      {
        text: "Docs",
        url: "/docs",
        icon: <BookOpen />,
        active: "nested-url",
      },
      {
        text: "Reference",
        url: "/reference",
        icon: <Code2 />,
        active: "nested-url",
      },
      {
        text: "Integrations",
        url: "/integrations",
        icon: <Puzzle />,
        active: "nested-url",
      },
      {
        text: "Changelog",
        url: "/changelog",
        icon: <History />,
        active: "nested-url",
      },
      {
        text: "FAQ",
        url: "/faq",
        icon: <HelpCircle />,
        active: "nested-url",
      },
    ],
  };
}

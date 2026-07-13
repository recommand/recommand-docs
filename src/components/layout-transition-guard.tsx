"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * The fumadocs grid (#nd-docs-layout) animates grid-template-columns for the
 * sidebar collapse. That same transition fires on client-side navigation when
 * the TOC column width changes (e.g. full-width index -> detail page with a
 * TOC), making the content visibly slide. Suppress the transition for the
 * navigation frame only, so the sidebar collapse animation stays intact.
 */
export function LayoutTransitionGuard() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const layouts = document.querySelectorAll<HTMLElement>("#nd-docs-layout");
    for (const layout of layouts) {
      layout.style.transitionProperty = "none";
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const layout of layouts) {
          layout.style.transitionProperty = "";
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

import type { ReactNode } from "react";

/**
 * The FAQ pages render their own letterhead sections full-bleed under the
 * HomeLayout chrome (like the landing page), so no nested DocsLayout here.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

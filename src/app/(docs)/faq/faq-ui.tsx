import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/* Hairline rule, letterhead style: ink on light, sheet on dark */
export const hairline = "border-darkslate/10 dark:border-sheet/15";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-2.5 text-folder-dark dark:text-folder">
      <span aria-hidden="true" className="inline-block h-2 w-2 rounded-[2px] bg-folder" />
      {children}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground no-underline transition-colors hover:text-fd-foreground"
    >
      <ArrowLeft
        aria-hidden="true"
        className="size-3.5 transition-transform group-hover:-translate-x-0.5"
      />
      {children}
    </Link>
  );
}

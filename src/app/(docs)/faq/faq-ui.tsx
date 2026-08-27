import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export { Eyebrow, hairline } from "@/components/letterhead";

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

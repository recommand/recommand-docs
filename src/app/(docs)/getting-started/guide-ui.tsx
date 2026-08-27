import Link from "next/link";
import type { ReactNode } from "react";
import { hairline } from "@/components/letterhead";
import type { AxisChoice } from "@/lib/country-guides-data";

/*
 * Shared chrome for the getting started pages. Everything here is plain markup
 * with no event handlers, so the same chips render from a Server Component (the
 * selector on a guide page, which only navigates) and from the client picker
 * (the hub, which answers in place). Keeping the markup in one module is what
 * stops the two selectors from drifting apart visually.
 */

export { Eyebrow } from "@/components/letterhead";
export { hairline };

/** The card the three questions sit in, on both the hub and every guide. */
export const questionPanel = `rounded-2xl border p-5 sm:p-6 ${hairline} bg-paper/40 dark:bg-sheet/[0.03]`;

const chipBase =
  "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left no-underline transition-colors";
const chipIdle = `${hairline} hover:border-folder-dark/40 hover:bg-paper/60 dark:hover:border-folder/40 dark:hover:bg-sheet/5`;
const chipActive =
  "border-folder-dark/60 bg-folder/10 dark:border-folder/60 dark:bg-folder/10";

export function chipClass(active: boolean): string {
  return `${chipBase} ${active ? chipActive : chipIdle}`;
}

/** The inside of a chip. Whoever renders it wraps it in the link. */
export function ChipBody({ choice }: { choice: AxisChoice }) {
  return (
    <>
      {choice.flag && (
        <span aria-hidden="true" className="text-lg leading-none">
          {choice.flag}
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-semibold text-fd-foreground text-sm">
          {choice.label}
        </span>
        <span className="block text-fd-muted-foreground text-xs">
          {choice.short}
        </span>
      </span>
    </>
  );
}

/** One column: the numbered question, then its answers underneath. */
export function QuestionColumn({
  step,
  legend,
  id,
  children,
}: {
  step: number;
  legend: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div aria-labelledby={id} role="group">
      <div className="flex items-baseline gap-2" id={id}>
        <span className="eyebrow text-folder-dark dark:text-folder">
          {step}
        </span>
        <span className="eyebrow text-stone-dark dark:text-stone">
          {legend}
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

/** Visible breadcrumb trail; its structured-data twin lives in the page. */
export function Breadcrumbs({
  trail,
}: {
  trail: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-fd-muted-foreground text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb, index) => (
          <li className="flex items-center gap-2" key={crumb.label}>
            {index > 0 && (
              <span aria-hidden="true" className="text-fd-muted-foreground/50">
                /
              </span>
            )}
            {crumb.href ? (
              <Link
                className="no-underline transition-colors hover:text-folder-dark dark:hover:text-folder"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-fd-foreground">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

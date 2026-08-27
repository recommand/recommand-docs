import type { ReactNode } from "react";

/*
 * The letterhead vocabulary shared by the pages that are not MDX documents —
 * the FAQ and the country-specific getting started guides. Both draw the same
 * hairline rules and the same mint-square eyebrow, so they live here rather
 * than being copied per section.
 */

/* Hairline rule, letterhead style: ink on light, sheet on dark. */
export const hairline = "border-darkslate/10 dark:border-sheet/15";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow flex items-center gap-2.5 text-folder-dark dark:text-folder">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-[2px] bg-folder"
      />
      {children}
    </div>
  );
}

/**
 * A JSON-LD block. `<` is escaped because the payload is interpolated into a
 * script element, where a literal `</script>` inside a string would end it.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has to be inlined as script content
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}

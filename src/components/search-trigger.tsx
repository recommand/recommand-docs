"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";

/**
 * Hero search styled as a "document sheet": a sheet-light input card with a
 * paper offset sheet behind it, mono keycap chips for the hotkey.
 */
export function SearchTrigger() {
  const { setOpenSearch, hotKey } = useSearchContext();

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-lg bg-paper dark:bg-slate"
      />
      <button
        type="button"
        className="relative inline-flex h-12 w-full items-center gap-3 rounded-lg border border-shadow/60 bg-sheet-light pe-3 ps-4 text-sm text-fd-muted-foreground shadow-lg transition-colors hover:border-shadow dark:border-sheet/20 dark:bg-darkslate dark:hover:border-sheet/40"
        onClick={() => setOpenSearch(true)}
      >
        <Search
          aria-hidden="true"
          className="size-4 shrink-0 text-folder-dark dark:text-folder"
        />
        Search documentation...
        <div className="ms-auto inline-flex gap-1">
          {hotKey.map((k, i) => (
            <kbd
              key={i}
              className="rounded-[4px] border border-shadow/60 bg-sheet px-1.5 py-0.5 font-mono text-xs text-fd-muted-foreground dark:border-sheet/20 dark:bg-slate"
            >
              {k.display}
            </kbd>
          ))}
        </div>
      </button>
    </div>
  );
}

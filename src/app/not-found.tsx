import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow flex items-center gap-2.5 text-folder-dark dark:text-folder">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-[2px] bg-folder"
        />
        404
      </p>
      <h1 className="display mt-5 text-5xl text-darkslate sm:text-6xl dark:text-sheet">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        This page may have moved. Try the search, or start from the
        documentation home.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-darkslate px-6 text-sm font-medium text-sheet transition-colors hover:bg-slate dark:bg-folder dark:text-darkslate dark:hover:bg-folder/90"
        >
          Documentation home
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/docs"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-darkslate/20 px-6 text-sm font-medium text-darkslate transition-colors hover:border-darkslate/40 dark:border-sheet/25 dark:text-sheet dark:hover:border-sheet/50"
        >
          <Search className="h-4 w-4" />
          Browse the guides
        </Link>
      </div>
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLinkIcon } from "lucide-react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "fumadocs-ui/components/ui/popover";

const cache = new Map<string, string>();

type CommonProps = {
  markdownUrl: string;
};

export function PageActions({ markdownUrl }: CommonProps) {
  const [isLoading, setLoading] = useState(false);
  const [checked, copyToClipboard] = useCopyButton(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) return navigator.clipboard.writeText(cached);

    setLoading(true);

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": fetch(markdownUrl).then(async (res) => {
            const content = await res.text();
            cache.set(markdownUrl, content);

            return content;
          }),
        }),
      ]);
    } finally {
      setLoading(false);
    }
  });

  const items = useMemo(() => {
    const fullMarkdownUrl =
      typeof window !== "undefined"
        ? new URL(markdownUrl, window.location.origin)
        : "loading";
    const q = `Read ${fullMarkdownUrl}, I want to ask questions about it.`;

    return [
      {
        title: "View as Markdown",
        href: markdownUrl,
        icon: (
          <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 208 128"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="198"
              height="118"
              x="5"
              y="5"
              ry="10"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
            />
            <path
              d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0l-30-33h20V30h20v35h20z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        title: "Open in ChatGPT",
        href: `https://chatgpt.com/?${new URLSearchParams({
          hints: "search",
          q,
        })}`,
        icon: (
          <svg
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>OpenAI</title>
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
          </svg>
        ),
      },
      {
        title: "Open in Claude",
        href: `https://claude.ai/new?${new URLSearchParams({
          q,
        })}`,
        icon: (
          <svg
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Anthropic</title>
            <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
          </svg>
        ),
      },
    ] as const;
  }, [markdownUrl]);

  // Outline buttons in the brand pattern: hairline darkslate borders that
  // deepen on hover, quiet paper hover fill (no full accent fills on light
  // surfaces). Written out instead of buttonVariants to avoid its accent
  // hover styles.
  const buttonClassName =
    "inline-flex items-center justify-center border px-2 py-1.5 text-xs font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring " +
    "border-darkslate/20 bg-transparent hover:border-darkslate/40 hover:bg-paper/60 dark:border-sheet/20 dark:hover:border-sheet/40 dark:hover:bg-sheet/10";

  return (
    <div className="inline-flex items-stretch rounded-lg shadow-xs">
      <button
        type="button"
        disabled={isLoading}
        onClick={copyToClipboard}
        className={`${buttonClassName} gap-2 rounded-l-lg`}
      >
        {checked ? (
          <Check className="size-4 text-folder-dark dark:text-folder" />
        ) : (
          <Copy className="size-4" />
        )}
        <span>{checked ? "Copied" : "Copy page"}</span>
      </button>
      <Popover>
        <PopoverTrigger
          className={`${buttonClassName} -ms-px rounded-r-lg px-2 data-[state=open]:border-darkslate/40 data-[state=open]:bg-folder/20 dark:data-[state=open]:border-sheet/40`}
        >
          <span className="sr-only">More page actions</span>
          <ChevronDown className="size-3.5 text-fd-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="flex flex-col p-1 min-w-[220px] border-darkslate/10 dark:border-sheet/15">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              rel="noreferrer noopener"
              target="_blank"
              className="text-sm p-2 rounded-lg inline-flex items-center gap-2 hover:bg-folder/15 [&_svg]:size-4 w-full text-left"
            >
              {item.icon}
              {item.title}
              <ExternalLinkIcon className="text-fd-muted-foreground size-3.5 ms-auto" />
            </a>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

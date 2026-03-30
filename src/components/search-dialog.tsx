"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import type { SharedProps } from "fumadocs-ui/contexts/search";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogListItem,
  SearchDialogOverlay,
  type SearchItemType,
} from "fumadocs-ui/components/dialog/search";

type ResultSection = {
  key: string;
  label: string;
};

const sections: ResultSection[] = [
  { key: "guide", label: "Guides" },
  { key: "endpoint", label: "API Endpoints" },
  { key: "model", label: "Data Models" },
  { key: "integration", label: "Integrations" },
  { key: "faq", label: "FAQ" },
  { key: "changelog", label: "Changelog" },
];

function getSection(item: SearchItemType): ResultSection {
  if (item.type === "action") return sections[0];

  const url = item.url;

  if (url.startsWith("/reference/models/")) return sections[2];
  if (url.startsWith("/reference")) return sections[1];
  if (url.startsWith("/integrations")) return sections[3];
  if (url.startsWith("/faq")) return sections[4];
  if (url.startsWith("/changelog")) return sections[5];
  return sections[0];
}

function StructuredItem({
  item,
  onClick,
  showSection,
}: {
  item: SearchItemType;
  onClick: () => void;
  showSection: boolean;
}) {
  const section = getSection(item);

  return (
    <>
      {showSection ? (
        <div className="px-2.5 pt-3 pb-1 first:pt-1">
          <div className="border-fd-border/80 text-fd-muted-foreground inline-flex items-center rounded-full border bg-fd-secondary/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]">
            {section.label}
          </div>
        </div>
      ) : null}
      <SearchDialogListItem item={item} onClick={onClick} />
    </>
  );
}

export default function StructuredSearchDialog(props: SharedProps) {
  const { locale } = useI18n();
  const { search, setSearch, query } = useDocsSearch({
    type: "fetch",
    locale,
  });

  const items = query.data !== "empty" ? query.data : null;

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={items}
          Item={({ item, onClick }) => {
            const index =
              items?.findIndex((entry) => entry.id === item.id) ?? -1;
            const previous = index > 0 ? items?.[index - 1] : undefined;
            const showSection =
              !previous || getSection(previous).key !== getSection(item).key;

            return (
              <StructuredItem
                item={item}
                onClick={onClick}
                showSection={showSection}
              />
            );
          }}
        />
      </SearchDialogContent>
    </SearchDialog>
  );
}

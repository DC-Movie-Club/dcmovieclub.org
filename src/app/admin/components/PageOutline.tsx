"use client";

import Link from "next/link";
import {
  AlignLeft,
  ChevronRight,
  Heading,
  LayoutGrid,
  Link as LinkIcon,
  ListCollapse,
  Palette,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { pageTemplates, type PageKey, type SectionKind } from "@/config/pages";
import { cn } from "@/lib/utils";

const kindIcons = {
  text: { key: "text", icon: AlignLeft },
  links: { key: "links", icon: LinkIcon },
  cards: { key: "cards", icon: LayoutGrid },
  tags: { key: "tags", icon: Tags },
  faq: { key: "faq", icon: ListCollapse },
} as const satisfies Record<SectionKind, { key: SectionKind; icon: LucideIcon }>;

export type OutlineItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  dirty: boolean;
};

// The editable parts of a page, in the order they appear on it: the title (if
// admins edit it), each section, then the page's colors
export function outlineItems(
  page: PageKey,
  isDirty: (item: string) => boolean,
): OutlineItem[] {
  const item = (key: string, label: string, icon: LucideIcon) => ({
    key,
    label,
    icon,
    dirty: isDirty(key),
  });
  const sections: Record<string, { key: string; label: string; kind: SectionKind }> =
    pageTemplates[page].sections;
  const { title, subtitle } = pageTemplates[page];
  return [
    ...(title
      ? [item("title", subtitle ? "Title & subtitle" : "Title", Heading)]
      : []),
    ...Object.values(sections).map((section) =>
      item(section.key, section.label, kindIcons[section.kind].icon),
    ),
    item("colors", "Colors", Palette),
  ];
}

function UnsavedDot() {
  return (
    <span className="ml-auto flex size-4 shrink-0 items-center justify-center">
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="sr-only">Unsaved changes</span>
    </span>
  );
}

// Every page, with the open page's parts listed under it. Picking a part shows
// its form; picking another page opens that page.
export function PageOutline({
  page,
  items,
  selected,
  onSelect,
}: {
  page: PageKey;
  items: OutlineItem[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  return (
    <nav aria-label="Pages" className="flex flex-col gap-0.5 p-2">
      <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">
        Pages
      </p>
      {Object.values(pageTemplates).map((template) => {
        const isOpen = template.key === page;
        const dirty = isOpen && items.some((item) => item.dirty);
        return (
          <div key={template.key} className="flex flex-col gap-0.5">
            <Link
              href={`/admin/pages/${template.key}`}
              aria-current={isOpen ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isOpen && "font-medium text-foreground",
              )}
            >
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 transition-transform",
                  isOpen && "rotate-90",
                )}
              />
              {template.label}
              {dirty && <UnsavedDot />}
            </Link>
            {isOpen && (
              <ul className="mb-1 ml-[15px] flex flex-col gap-0.5 border-l pl-2">
                {items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-current={item.key === selected ? "true" : undefined}
                      onClick={() => onSelect(item.key)}
                      className={cn(
                        "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        item.key === selected &&
                          "bg-muted font-medium text-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0 opacity-70" />
                      <span className="truncate">{item.label}</span>
                      {item.dirty && <UnsavedDot />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

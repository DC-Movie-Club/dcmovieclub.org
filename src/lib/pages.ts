import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isColorRoleKey,
  pageTemplates,
  type PageColors,
  type PageKey,
  type SectionKind,
} from "@/config/pages";

export const PAGES_COLLECTION = "pages";

type SectionBase = {
  key: string;
  label: string;
  updatedAt: string | null;
  updatedByName: string | null;
};

export type LinkItem = { key: string; title: string; url: string };
export type FaqItem = { key: string; question: string; answer: string };

export type PageSection =
  | (SectionBase & { kind: "text"; content: string })
  | (SectionBase & { kind: "links"; items: LinkItem[] })
  | (SectionBase & { kind: "faq"; items: FaqItem[] });

export type PageContent = {
  key: PageKey;
  title: string;
  cta: { label: string; href: string } | null;
  colors: PageColors;
  sections: PageSection[];
};

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

// Items are stored as a map keyed by id, each with an `order`
function orderedItems(value: unknown) {
  return Object.entries(record(value))
    .map(([key, item]) => ({ ...record(item), key }))
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
}

function toSection(
  key: string,
  kind: SectionKind,
  raw: Record<string, unknown>,
): PageSection {
  const base = {
    key,
    label: text(raw.label),
    updatedAt: isoDate(raw.updatedAt),
    updatedByName: text(raw.updatedByName) || null,
  };
  switch (kind) {
    case "text":
      return { ...base, kind, content: text(raw.content) };
    case "links":
      return {
        ...base,
        kind,
        items: orderedItems(raw.items).map((item) => ({
          key: item.key,
          title: text(item.title),
          url: text(item.url),
        })),
      };
    case "faq":
      return {
        ...base,
        kind,
        items: orderedItems(raw.items).map((item) => ({
          key: item.key,
          question: text(item.question),
          answer: text(item.answer),
        })),
      };
  }
}

// Reads the page doc into its template's shape, so a missing or malformed
// field renders as empty instead of breaking the page
async function fetchPage(key: PageKey): Promise<PageContent> {
  const snap = await getAdminDb().collection(PAGES_COLLECTION).doc(key).get();
  const data = record(snap.data());
  const sections = record(data.sections);
  const cta = record(data.cta);

  return {
    key,
    title: text(data.title),
    cta:
      text(cta.label) && text(cta.href)
        ? { label: text(cta.label), href: text(cta.href) }
        : null,
    colors: Object.fromEntries(
      Object.entries(record(data.colors)).filter(
        ([role, hex]) =>
          isColorRoleKey(role) && typeof hex === "string" && HEX_COLOR.test(hex),
      ),
    ) as PageColors,
    sections: Object.values(pageTemplates[key].sections).map((section) =>
      toSection(section.key, section.kind, record(sections[section.key])),
    ),
  };
}

export function pageTag(key: PageKey) {
  return `page:${key}`;
}

// Saving a page calls updateTag(pageTag(key)), but Next's cache is per server
// instance, so other instances pick up the edit when `revalidate` runs out
export const getPage = cache((key: PageKey) =>
  unstable_cache(() => fetchPage(key), ["page", key], {
    tags: [pageTag(key)],
    revalidate: 1800,
  })(),
);

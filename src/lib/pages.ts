import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isColorRoleKey,
  isHexColor,
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

export type PageCta = { label: string; href: string };

// `updatedAt`/`updatedByName` cover the page's own fields (title, CTA, colors);
// each section tracks its own
export type PageContent = {
  key: PageKey;
  title: string;
  cta: PageCta | null;
  colors: PageColors;
  sections: PageSection[];
  updatedAt: string | null;
  updatedByName: string | null;
};

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

// Reads a page doc into its template's shape, so a missing or malformed field
// renders as empty instead of breaking the page
export function pageFromData(
  key: PageKey,
  data: Record<string, unknown>,
): PageContent {
  const cta = record(data.cta);
  const sections = record(data.sections);
  return {
    key,
    title: text(data.title),
    cta:
      text(cta.label) && text(cta.href)
        ? { label: text(cta.label), href: text(cta.href) }
        : null,
    colors: Object.fromEntries(
      Object.entries(record(data.colors)).filter(
        ([role, hex]) => isColorRoleKey(role) && isHexColor(hex),
      ),
    ) as PageColors,
    sections: Object.values(pageTemplates[key].sections).map((section) =>
      toSection(section.key, section.kind, record(sections[section.key])),
    ),
    updatedAt: isoDate(data.updatedAt),
    updatedByName: text(data.updatedByName) || null,
  };
}

// Uncached, for the admin; the public site reads through getPage
export async function readPage(key: PageKey): Promise<PageContent> {
  const snap = await getAdminDb().collection(PAGES_COLLECTION).doc(key).get();
  return pageFromData(key, record(snap.data()));
}

export function pageTag(key: PageKey) {
  return `page:${key}`;
}

// Saving a page calls updateTag(pageTag(key)), but Next's cache is per server
// instance, so other instances pick up the edit when `revalidate` runs out
export const getPage = cache((key: PageKey) =>
  unstable_cache(() => readPage(key), ["page", key], {
    tags: [pageTag(key)],
    revalidate: 1800,
  })(),
);

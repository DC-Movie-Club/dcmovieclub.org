import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  isColorRoleKey,
  isHexColor,
  isPageKey,
  pageTemplates,
  type NavColors,
  type PageColors,
  type PageKey,
  type SectionKind,
} from "@/config/pages";

export const PAGES_COLLECTION = "pages";

export type LinkItem = { key: string; title: string; url: string };
// `source` is who published the link, like "City Cast DC"; `image` is the
// address of the picture the link's site offers for previews
export type CardItem = LinkItem & { source: string; image: string };
export type FaqItem = { key: string; question: string; answer: string };

export type PageSection =
  | { key: string; kind: "text"; label: string; content: string }
  | { key: string; kind: "links" | "tags"; label: string; items: LinkItem[] }
  | { key: string; kind: "cards"; label: string; items: CardItem[] }
  | { key: string; kind: "faq"; label: string; items: FaqItem[] };

export type PageContent = {
  key: PageKey;
  title: string;
  subtitle: string;
  colors: PageColors;
  // Only Home sets these (see navPages)
  navColors: NavColors;
  sections: PageSection[];
  updatedAt: string | null;
  updatedByName: string | null;
};

// What a page renders from: its content, without the save metadata
export type PageView = Pick<
  PageContent,
  "key" | "title" | "subtitle" | "colors" | "sections"
>;

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
    .map(
      ([key, item]): Record<string, unknown> & { key: string } => ({
        ...record(item),
        key,
      }),
    )
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
}

function toSection(
  key: string,
  kind: SectionKind,
  raw: Record<string, unknown>,
): PageSection {
  const base = { key, label: text(raw.label) };
  switch (kind) {
    case "text":
      return { ...base, kind, content: text(raw.content) };
    case "links":
    case "tags":
      return {
        ...base,
        kind,
        items: orderedItems(raw.items).map((item) => ({
          key: item.key,
          title: text(item.title),
          url: text(item.url),
        })),
      };
    case "cards":
      return {
        ...base,
        kind,
        items: orderedItems(raw.items).map((item) => ({
          key: item.key,
          title: text(item.title),
          url: text(item.url),
          source: text(item.source),
          image: text(item.image),
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
  const sections = record(data.sections);
  return {
    key,
    title: text(data.title),
    subtitle: text(data.subtitle),
    colors: Object.fromEntries(
      Object.entries(record(data.colors)).filter(
        ([role, hex]) => isColorRoleKey(role) && isHexColor(hex),
      ),
    ) as PageColors,
    navColors: Object.fromEntries(
      Object.entries(record(data.navColors)).filter(
        ([page, hex]) => isPageKey(page) && isHexColor(hex),
      ),
    ) as NavColors,
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

// The color the bottom nav gives each page's item, by route: Home's nav color
// for it, or else the page's accent, for pages that have either. Read through
// getPage, so saving Home or the page updates the nav too.
export async function getPageAccents(): Promise<Record<string, string>> {
  const { navColors } = await getPage(pageTemplates.home.key);
  const accents: Record<string, string> = {};
  await Promise.all(
    Object.values(pageTemplates).map(async ({ key, href }) => {
      const color = navColors[key] ?? (await getPage(key)).colors.accent;
      if (color) accents[href] = color;
    }),
  );
  return accents;
}

// Each page's background, by route, for pages that set one
export async function getPageBackgrounds(): Promise<Record<string, string>> {
  const backgrounds: Record<string, string> = {};
  await Promise.all(
    Object.values(pageTemplates).map(async ({ key, href }) => {
      const color = (await getPage(key)).colors.background;
      if (color) backgrounds[href] = color;
    }),
  );
  return backgrounds;
}

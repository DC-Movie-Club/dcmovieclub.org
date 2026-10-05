"use server";

import { updateTag } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";
import {
  isColorRoleKey,
  isHexColor,
  isPageKey,
  pageTemplates,
  type PageColors,
  type PageKey,
} from "@/config/pages";
import {
  PAGES_COLLECTION,
  pageFromData,
  pageTag,
  type PageContent,
  type PageSection,
} from "@/lib/pages";

async function requireEditor() {
  const token = await requireAdmin();
  const phone = token.phone_number ?? null;
  const admin = phone
    ? await getAdminDb().collection("allowedPhones").doc(phone).get()
    : null;
  return {
    updatedBy: phone,
    updatedByName: (admin?.data()?.name as string | undefined)?.trim() || phone,
  };
}

export type PageDraft = {
  title: string;
  subtitle: string;
  colors: PageColors;
  sections: PageSection[];
};

export type SavePageResult =
  | { ok: true; saved: PageContent }
  | { ok: false; conflict: PageContent };

const ITEM_KEY = /^[a-z0-9-]{1,64}$/;

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function validColors(colors: PageColors): PageColors {
  for (const [role, hex] of Object.entries(colors)) {
    if (!isColorRoleKey(role) || !isHexColor(hex)) {
      throw new Error(`Invalid color ${role}: ${hex}`);
    }
  }
  return colors;
}

// Items are stored as a map keyed by id, each with its position as `order`
function keyedItems<T extends { key: string }>(
  items: T[],
  fields: (item: T) => Record<string, string>,
) {
  const seen = new Set<string>();
  return Object.fromEntries(
    items.map((item, order) => {
      if (!ITEM_KEY.test(item.key) || seen.has(item.key)) {
        throw new Error(`Invalid item key: ${item.key}`);
      }
      seen.add(item.key);
      return [item.key, { key: item.key, order, ...fields(item) }];
    }),
  );
}

// Rebuilds the sections from the page's template, so a draft can only fill in
// the sections the template defines
function sectionsData(page: PageKey, sections: PageSection[]) {
  return Object.fromEntries(
    Object.values(pageTemplates[page].sections).map((template) => {
      const section = sections.find((s) => s.key === template.key);
      if (!section || section.kind !== template.kind) {
        throw new Error(`Missing ${template.kind} section: ${template.key}`);
      }
      switch (section.kind) {
        case "text":
          return [
            section.key,
            {
              key: section.key,
              label: text(section.label).trim(),
              content: text(section.content),
            },
          ];
        case "links":
        case "tags":
          return [
            section.key,
            {
              key: section.key,
              label: text(section.label).trim(),
              items: keyedItems(section.items, (item) => ({
                title: text(item.title).trim(),
                url: text(item.url).trim(),
              })),
            },
          ];
        case "faq":
          return [
            section.key,
            {
              key: section.key,
              label: text(section.label).trim(),
              items: keyedItems(section.items, (item) => ({
                question: text(item.question).trim(),
                answer: text(item.answer),
              })),
            },
          ];
      }
    }),
  );
}

export async function savePage(input: {
  page: string;
  draft: PageDraft;
  baselineUpdatedAt: string | null;
  force?: boolean;
}): Promise<SavePageResult> {
  const editor = await requireEditor();
  const { page, draft } = input;
  if (!isPageKey(page)) throw new Error(`Unknown page: ${page}`);

  const data = {
    key: page,
    title: text(draft.title).trim(),
    subtitle: pageTemplates[page].subtitle ? text(draft.subtitle).trim() : "",
    colors: validColors(draft.colors),
    sections: sectionsData(page, draft.sections),
    updatedAt: Timestamp.now(),
    ...editor,
  };

  const db = getAdminDb();
  const ref = db.collection(PAGES_COLLECTION).doc(page);
  const result = await db.runTransaction(async (tx): Promise<SavePageResult> => {
    const current = pageFromData(page, (await tx.get(ref)).data() ?? {});
    if (!input.force && current.updatedAt !== input.baselineUpdatedAt) {
      return { ok: false, conflict: current };
    }
    tx.set(ref, data);
    return { ok: true, saved: pageFromData(page, data) };
  });

  if (result.ok) updateTag(pageTag(page));
  return result;
}

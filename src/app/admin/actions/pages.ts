"use server";

import { updateTag } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";
import {
  isColorRoleKey,
  isHexColor,
  isPageKey,
  type PageColors,
} from "@/config/pages";
import {
  PAGES_COLLECTION,
  pageFromData,
  pageTag,
  type PageContent,
  type PageCta,
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

export type PageSettings = {
  title: string;
  cta: PageCta | null;
  colors: PageColors;
};

export type SavePageResult =
  | { ok: true; saved: PageContent }
  | { ok: false; conflict: PageContent };

function validColors(colors: PageColors): PageColors {
  for (const [role, hex] of Object.entries(colors)) {
    if (!isColorRoleKey(role) || !isHexColor(hex)) {
      throw new Error(`Invalid color ${role}: ${hex}`);
    }
  }
  return colors;
}

export async function savePageSettings(input: {
  page: string;
  settings: PageSettings;
  baselineUpdatedAt: string | null;
  force?: boolean;
}): Promise<SavePageResult> {
  const editor = await requireEditor();
  const { page, settings } = input;
  if (!isPageKey(page)) throw new Error(`Unknown page: ${page}`);

  const label = settings.cta?.label.trim() ?? "";
  const href = settings.cta?.href.trim() ?? "";
  const fields = {
    key: page,
    title: settings.title.trim(),
    cta: label && href ? { label, href } : null,
    colors: validColors(settings.colors),
    updatedAt: Timestamp.now(),
    ...editor,
  };

  const db = getAdminDb();
  const ref = db.collection(PAGES_COLLECTION).doc(page);
  const result = await db.runTransaction(async (tx): Promise<SavePageResult> => {
    const data = (await tx.get(ref)).data() ?? {};
    const current = pageFromData(page, data);
    if (!input.force && current.updatedAt !== input.baselineUpdatedAt) {
      return { ok: false, conflict: current };
    }
    // mergeFields replaces each listed field whole (so a cleared color is
    // removed) while leaving the sections untouched
    tx.set(ref, fields, { mergeFields: Object.keys(fields) });
    return { ok: true, saved: pageFromData(page, { ...data, ...fields }) };
  });

  if (result.ok) updateTag(pageTag(page));
  return result;
}

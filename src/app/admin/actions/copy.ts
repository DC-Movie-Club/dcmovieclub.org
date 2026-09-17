"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";
import { COPY_COLLECTION, snapshotToCopy, type CopyDoc } from "@/lib/copy";
import { isCopySlotKey } from "@/config/copy";

export type SaveCopyResult =
  | { ok: true; saved: CopyDoc }
  | { ok: false; conflict: CopyDoc };

export async function saveCopy(input: {
  key: string;
  content: string;
  baselineUpdatedAt: string | null;
  force?: boolean;
}): Promise<SaveCopyResult> {
  const token = await requireAdmin();
  const { key } = input;
  if (!isCopySlotKey(key)) throw new Error(`Unknown copy slot: ${key}`);

  const db = getAdminDb();
  const phone = token.phone_number ?? null;
  const admin = phone
    ? await db.collection("allowedPhones").doc(phone).get()
    : null;
  const updatedByName =
    (admin?.data()?.name as string | undefined)?.trim() || phone;

  const ref = db.collection(COPY_COLLECTION).doc(key);
  return db.runTransaction(async (tx) => {
    const current = snapshotToCopy(key, await tx.get(ref));

    if (!input.force && current.updatedAt !== input.baselineUpdatedAt) {
      return { ok: false, conflict: current };
    }

    const now = new Date();
    tx.set(ref, {
      content: input.content,
      updatedAt: now,
      updatedBy: phone,
      updatedByName,
    });

    return {
      ok: true,
      saved: {
        key,
        content: input.content,
        updatedAt: now.toISOString(),
        updatedByName,
      },
    };
  });
}

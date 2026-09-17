import { cache } from "react";
import { connection } from "next/server";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CopySlotKey } from "@/config/copy";

export const COPY_COLLECTION = "copy";

export type CopyDoc = {
  key: CopySlotKey;
  content: string;
  updatedAt: string | null;
  updatedByName: string | null;
};

export function snapshotToCopy(key: CopySlotKey, snap: DocumentSnapshot): CopyDoc {
  const data = snap.data();
  return {
    key,
    content: (data?.content as string) ?? "",
    updatedAt: data?.updatedAt?.toDate().toISOString() ?? null,
    updatedByName: (data?.updatedByName as string) ?? null,
  };
}

// Read on every request rather than cached, so a save shows up on the next page load
export const getCopy = cache(async (key: CopySlotKey): Promise<CopyDoc> => {
  await connection();
  const snap = await getAdminDb().collection(COPY_COLLECTION).doc(key).get();
  return snapshotToCopy(key, snap);
});

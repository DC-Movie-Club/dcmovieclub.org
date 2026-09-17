"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";

const DOC_PATH = { collection: "admin", docId: "resources" } as const;

export type ResourcesDoc = {
  content: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
};

async function resolveName(phone: string | null): Promise<string | null> {
  if (!phone) return null;
  const snap = await getAdminDb().collection("allowedPhones").doc(phone).get();
  const name = snap.data()?.name as string | undefined;
  return name?.trim() || null;
}

export async function getResources(): Promise<ResourcesDoc> {
  await requireAdmin();
  const snap = await getAdminDb()
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.docId)
    .get();

  if (!snap.exists) {
    return {
      content: "",
      updatedAt: null,
      updatedBy: null,
      updatedByName: null,
    };
  }

  const data = snap.data()!;
  const updatedBy = (data.updatedBy as string) ?? null;
  return {
    content: (data.content as string) ?? "",
    updatedAt: data.updatedAt?.toDate().toISOString() ?? null,
    updatedBy,
    updatedByName: await resolveName(updatedBy),
  };
}

export type SaveResult =
  | { ok: true; saved: ResourcesDoc }
  | { ok: false; conflict: ResourcesDoc };

export async function saveResources(input: {
  baselineUpdatedAt: string | null;
  content: string;
  force?: boolean;
}): Promise<SaveResult> {
  const phone = (await requireAdmin()).phone_number ?? null;
  const ref = getAdminDb()
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.docId);

  const db = getAdminDb();
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const currentUpdatedAt =
      snap.exists && snap.data()?.updatedAt
        ? snap.data()!.updatedAt.toDate().toISOString()
        : null;

    if (
      !input.force &&
      currentUpdatedAt !== input.baselineUpdatedAt
    ) {
      return {
        ok: false as const,
        conflict: {
          content: (snap.data()?.content as string) ?? "",
          updatedAt: currentUpdatedAt,
          updatedBy: (snap.data()?.updatedBy as string) ?? null,
        },
      };
    }

    const now = new Date();
    tx.set(ref, {
      content: input.content,
      updatedAt: now,
      updatedBy: phone ?? "unknown",
    });

    return {
      ok: true as const,
      saved: {
        content: input.content,
        updatedAt: now.toISOString(),
        updatedBy: phone ?? "unknown",
      },
    };
  });

  if (result.ok) {
    return {
      ok: true,
      saved: {
        ...result.saved,
        updatedByName: await resolveName(result.saved.updatedBy),
      },
    };
  }

  return {
    ok: false,
    conflict: {
      ...result.conflict,
      updatedByName: await resolveName(result.conflict.updatedBy),
    },
  };
}

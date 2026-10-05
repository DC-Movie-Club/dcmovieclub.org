"use server";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-session";
import { isHexColor } from "@/config/pages";
import { brandRef, swatchesFromData, type BrandSwatch } from "@/lib/brand";

const SWATCH_KEY = /^[a-z0-9-]{1,64}$/;

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

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function uniqueKey(base: string, taken: Set<string>) {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function addBrandSwatch(input: {
  label: string;
  hex: string;
}): Promise<BrandSwatch[]> {
  const editor = await requireEditor();
  const hex = typeof input.hex === "string" ? input.hex.toLowerCase() : "";
  if (!isHexColor(hex)) throw new Error(`Invalid color: ${input.hex}`);
  const label =
    (typeof input.label === "string" ? input.label.trim() : "").slice(0, 60) ||
    hex;

  const db = getAdminDb();
  const ref = brandRef();
  return db.runTransaction(async (tx) => {
    const swatches = swatchesFromData((await tx.get(ref)).data());
    const key = uniqueKey(
      slug(label) || slug(hex) || "swatch",
      new Set(swatches.map((s) => s.key)),
    );
    const order = Math.max(-1, ...swatches.map((s) => s.order)) + 1;
    const swatch = { key, label, hex, order };

    tx.set(
      ref,
      {
        key: "brand",
        swatches: { [key]: swatch },
        updatedAt: Timestamp.now(),
        ...editor,
      },
      { merge: true },
    );
    return [...swatches, swatch];
  });
}

export async function removeBrandSwatch(key: string): Promise<BrandSwatch[]> {
  const editor = await requireEditor();
  if (typeof key !== "string" || !SWATCH_KEY.test(key)) {
    throw new Error(`Invalid swatch key: ${key}`);
  }

  const db = getAdminDb();
  const ref = brandRef();
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const swatches = swatchesFromData(snap.data());
    if (!snap.exists) return swatches;

    tx.update(ref, {
      [`swatches.${key}`]: FieldValue.delete(),
      updatedAt: Timestamp.now(),
      ...editor,
    });
    return swatches.filter((s) => s.key !== key);
  });
}

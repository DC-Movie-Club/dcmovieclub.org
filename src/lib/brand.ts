import { isHexColor } from "@/config/pages";
import { getAdminDb } from "@/lib/firebase-admin";

export const BRAND_DOC = { collection: "site", id: "brand" } as const;

export type BrandSwatch = {
  key: string;
  label: string;
  hex: string;
  order: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

// Swatches are stored as a map keyed by id, each with its position as `order`
export function swatchesFromData(data: unknown): BrandSwatch[] {
  return Object.entries(record(record(data).swatches))
    .map(([key, raw]) => {
      const swatch = record(raw);
      return {
        key,
        label: typeof swatch.label === "string" ? swatch.label : "",
        hex: typeof swatch.hex === "string" ? swatch.hex : "",
        order: Number(swatch.order ?? 0),
      };
    })
    .filter((swatch) => isHexColor(swatch.hex))
    .sort((a, b) => a.order - b.order);
}

export function brandRef() {
  return getAdminDb().collection(BRAND_DOC.collection).doc(BRAND_DOC.id);
}

// Uncached; only the admin reads swatches
export async function readBrandSwatches(): Promise<BrandSwatch[]> {
  return swatchesFromData((await brandRef().get()).data());
}

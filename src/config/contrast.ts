import {
  fallbackOf,
  isHexColor,
  type ColorRoleKey,
} from "@/config/pages";

// Colors fixed in code (see globals.css) that page colors are read against
export const fixedColors = {
  creamCard: { key: "creamCard", label: "cream cards", hex: "#efecdf" },
} as const;

type FixedColorKey = keyof typeof fixedColors;
export type PartnerKey = ColorRoleKey | FixedColorKey;

export function isFixedColorKey(value: string): value is FixedColorKey {
  return Object.hasOwn(fixedColors, value);
}

// The last fallback of a text role in globals.css
const CHARCOAL = "#393a3e";

type ContrastPartners = {
  [K in ColorRoleKey]?: {
    key: K;
    // Each partner, with the WCAG AA minimum ratio for the pair
    partners: { [P in PartnerKey]?: number };
    // The faintest the role's text gets over its partner, as an opacity. The
    // pair is checked there.
    faintest?: number;
  };
};

// The colors each role is read against. AA asks 4.5:1 of regular text and
// 3:1 of large text, which the outlined lettering is.
export const contrastPartners = {
  background: { key: "background", partners: { foreground: 4.5, ink: 3 } },
  foreground: { key: "foreground", partners: { background: 4.5 } },
  cardText: {
    key: "cardText",
    partners: { creamCard: 4.5 },
    faintest: 0.8,
  },
  ink: { key: "ink", partners: { background: 3 } },
  accent: { key: "accent", partners: { accentText: 4.5 } },
  accentText: { key: "accentText", partners: { accent: 4.5 } },
} as const satisfies ContrastPartners;

export function partnersOf(role: ColorRoleKey): [PartnerKey, number][] {
  const entry = (contrastPartners as ContrastPartners)[role];
  return entry
    ? (Object.entries(entry.partners) as [PartnerKey, number][])
    : [];
}

export function faintestOf(role: ColorRoleKey): number {
  return (contrastPartners as ContrastPartners)[role]?.faintest ?? 1;
}

// The color a role shows in on the page, and the role it comes from: its own,
// or while it's unset, its fallback's, and past the last fallback charcoal
// (`from` null). Null for an unset role without a fallback.
export function shownColor(
  role: ColorRoleKey,
  colors: Record<ColorRoleKey, string>,
): { hex: string; from: ColorRoleKey | null } | null {
  const own = colors[role];
  if (isHexColor(own)) return { hex: own, from: role };
  const fallback = fallbackOf(role);
  if (!fallback) return null;
  return shownColor(fallback, colors) ?? { hex: CHARCOAL, from: null };
}

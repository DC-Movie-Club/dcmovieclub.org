import type { ColorRoleKey } from "@/config/pages";

type ContrastPartners = {
  [K in ColorRoleKey]?: {
    key: K;
    // Each partner role, with the WCAG AA minimum ratio for the pair
    partners: { [P in ColorRoleKey]?: number };
  };
};

// The colors each role is read against. AA asks 4.5:1 of regular text and
// 3:1 of large text, which the outlined lettering is.
export const contrastPartners = {
  background: { key: "background", partners: { foreground: 4.5, ink: 3 } },
  foreground: { key: "foreground", partners: { background: 4.5 } },
  ink: { key: "ink", partners: { background: 3 } },
  accent: { key: "accent", partners: { accentText: 4.5 } },
  accentText: { key: "accentText", partners: { accent: 4.5 } },
} as const satisfies ContrastPartners;

export function partnersOf(role: ColorRoleKey): [ColorRoleKey, number][] {
  const entry = (contrastPartners as ContrastPartners)[role];
  return entry
    ? (Object.entries(entry.partners) as [ColorRoleKey, number][])
    : [];
}

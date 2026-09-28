import type { CSSProperties } from "react";

// Each role is a CSS variable that page components color with (bg-page-bg,
// border-page-accent-edge, …); a role a page doesn't set falls back to a
// neutral color in globals.css.
export const colorRoles = {
  background: { key: "background", label: "Background", cssVar: "--page-bg" },
  ink: { key: "ink", label: "Lettering outline", cssVar: "--page-ink" },
  edge: { key: "edge", label: "Card border", cssVar: "--page-edge" },
  accent: { key: "accent", label: "Button", cssVar: "--page-accent" },
  accentEdge: { key: "accentEdge", label: "Button border", cssVar: "--page-accent-edge" },
  accentText: { key: "accentText", label: "Button text", cssVar: "--page-accent-text" },
} as const;

export type ColorRoleKey = keyof typeof colorRoles;
export type PageColors = Partial<Record<ColorRoleKey, string>>;

export function isColorRoleKey(value: string): value is ColorRoleKey {
  return Object.hasOwn(colorRoles, value);
}

export function colorVars(colors: PageColors): CSSProperties {
  return Object.fromEntries(
    Object.entries(colors).map(([role, hex]) => [
      colorRoles[role as ColorRoleKey].cssVar,
      hex,
    ]),
  );
}

export const sectionKinds = {
  text: { key: "text", label: "Text" },
  links: { key: "links", label: "Links" },
  faq: { key: "faq", label: "Questions" },
} as const;

export type SectionKind = keyof typeof sectionKinds;

type PageTemplate = {
  key: string;
  label: string;
  sections: Record<string, { key: string; kind: SectionKind }>;
};

// The structure of each page, in render order. Everything shown in it (titles,
// labels, content, colors) lives in Firestore at pages/{key}.
export const pageTemplates = {
  about: {
    key: "about",
    label: "About",
    sections: {
      intro: { key: "intro", kind: "text" },
      mission: { key: "mission", kind: "text" },
      news: { key: "news", kind: "links" },
      follow: { key: "follow", kind: "text" },
      faq: { key: "faq", kind: "faq" },
    },
  },
} as const satisfies Record<string, PageTemplate>;

export type PageKey = keyof typeof pageTemplates;

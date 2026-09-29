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

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
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
  href: string;
  sections: Record<string, { key: string; label: string; kind: SectionKind }>;
};

// The structure of each page, in render order. Labels here only name things in
// the admin; everything shown on the page (titles, headings, content, colors)
// lives in Firestore at pages/{key}.
export const pageTemplates = {
  about: {
    key: "about",
    label: "About",
    href: "/about",
    sections: {
      intro: { key: "intro", label: "Intro", kind: "text" },
      mission: { key: "mission", label: "Mission", kind: "text" },
      news: { key: "news", label: "In the News", kind: "links" },
      follow: { key: "follow", label: "Follow Us", kind: "text" },
      faq: { key: "faq", label: "FAQ", kind: "faq" },
      conduct: { key: "conduct", label: "Code of Conduct", kind: "text" },
    },
  },
} as const satisfies Record<string, PageTemplate>;

export type PageKey = keyof typeof pageTemplates;

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(pageTemplates, value);
}

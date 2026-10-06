import type { CSSProperties } from "react";

// Each role is a CSS variable that page components color with (bg-page-bg,
// border-page-accent-edge, …); a role a page doesn't set falls back to a
// neutral color in globals.css, or to the role named as its `fallback`. Keys
// are field names in Firestore, so they stay put even when labels change.
export const colorRoles = {
  background: { key: "background", label: "Background", cssVar: "--page-bg" },
  foreground: { key: "foreground", label: "Page text", cssVar: "--page-fg" },
  cardText: {
    key: "cardText",
    label: "Card text",
    cssVar: "--page-card-text",
    fallback: "ink",
    // Its field's placeholder while unset, short enough to fit
    placeholder: "Outline",
  },
  ink: { key: "ink", label: "Lettering outline", cssVar: "--page-ink" },
  edge: { key: "edge", label: "Card border", cssVar: "--page-edge" },
  accent: { key: "accent", label: "Accent", cssVar: "--page-accent" },
  accentEdge: { key: "accentEdge", label: "Accent border", cssVar: "--page-accent-edge" },
  accentText: { key: "accentText", label: "Accent text", cssVar: "--page-accent-text" },
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

type ColorRole = {
  key: ColorRoleKey;
  label: string;
  fallback?: ColorRoleKey;
  placeholder?: string;
};

// The role an unset role shows instead, if it has one
export function fallbackOf(role: ColorRoleKey): ColorRoleKey | null {
  const entry: ColorRole = colorRoles[role];
  return entry.fallback ?? null;
}

export function placeholderOf(role: ColorRoleKey): string | undefined {
  const entry: ColorRole = colorRoles[role];
  return entry.placeholder;
}

// Every role is written, an unset one as `initial` (which makes var() take its
// fallback), so a scope nested in another page's, like Home's bands, never
// shows a color the outer page set
export function colorVars(colors: PageColors): CSSProperties {
  return Object.fromEntries(
    Object.values(colorRoles).map((role) => [
      role.cssVar,
      colors[role.key] ?? "initial",
    ]),
  );
}

// Content sections hold copy and lists. Live data (events, posts, reviews)
// isn't a section: each page places it itself.
export const sectionKinds = {
  text: { key: "text", label: "Text" },
  links: { key: "links", label: "Links" },
  cards: { key: "cards", label: "Link cards" },
  tags: { key: "tags", label: "Tags" },
  faq: { key: "faq", label: "Dropdowns" },
} as const satisfies Record<string, { key: string; label: string }>;

export type SectionKind = keyof typeof sectionKinds;

type SectionTemplate = {
  key: string;
  label: string;
  kind: SectionKind;
  // What one item in a list is called, for buttons like "Add question"
  item?: string;
};

type PageTemplate = {
  key: string;
  label: string;
  href: string;
  // Whether admins edit the page's title and subtitle
  title: boolean;
  subtitle: boolean;
  sections: Record<string, SectionTemplate>;
};

// The structure of each page, in render order. Labels here only name things in
// the admin; everything admins edit (titles, headings, content, colors) lives
// in Firestore at pages/{key}.
export const pageTemplates = {
  home: {
    key: "home",
    label: "Home",
    href: "/",
    title: false,
    subtitle: false,
    sections: {
      about: { key: "about", label: "About", kind: "text" },
    },
  },
  events: {
    key: "events",
    label: "Events",
    href: "/events",
    title: true,
    subtitle: true,
    sections: {
      intro: { key: "intro", label: "Intro", kind: "text" },
      types: { key: "types", label: "Event types", kind: "faq", item: "event type" },
    },
  },
  blog: {
    key: "blog",
    label: "Blog",
    href: "/blog",
    title: true,
    subtitle: true,
    sections: {},
  },
  about: {
    key: "about",
    label: "About",
    href: "/about",
    title: true,
    subtitle: false,
    sections: {
      intro: { key: "intro", label: "Intro", kind: "text" },
      mission: { key: "mission", label: "Mission", kind: "text" },
      news: { key: "news", label: "In the News", kind: "cards", item: "link" },
      follow: { key: "follow", label: "Follow Us", kind: "text" },
      faq: { key: "faq", label: "FAQ", kind: "faq", item: "question" },
      conduct: { key: "conduct", label: "Code of Conduct", kind: "text" },
    },
  },
  partnerships: {
    key: "partnerships",
    label: "Partnerships",
    href: "/partnerships",
    title: true,
    subtitle: false,
    sections: {
      collab: { key: "collab", label: "Collaborate", kind: "text" },
      partners: { key: "partners", label: "Partners", kind: "tags", item: "partner" },
      contact: { key: "contact", label: "Get in Touch", kind: "text" },
    },
  },
} as const satisfies Record<string, PageTemplate>;

export type PageKey = keyof typeof pageTemplates;

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(pageTemplates, value);
}

// The bottom nav has an item for every page but Home, whose item is the logo.
// An item takes its page's accent color, unless Home's nav colors (stored on
// pages/home) give it another.
export const navPages = Object.values(pageTemplates).filter(
  (page) => page.key !== pageTemplates.home.key,
);

export type NavColors = Partial<Record<PageKey, string>>;

export function sectionTemplate(page: PageKey, key: string) {
  const sections: Record<string, SectionTemplate> = pageTemplates[page].sections;
  return sections[key];
}

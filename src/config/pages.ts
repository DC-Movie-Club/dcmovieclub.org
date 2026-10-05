import type { CSSProperties } from "react";

// Each role is a CSS variable that page components color with (bg-page-bg,
// border-page-accent-edge, …); a role a page doesn't set falls back to a
// neutral color in globals.css.
export const colorRoles = {
  background: { key: "background", label: "Background", cssVar: "--page-bg" },
  foreground: { key: "foreground", label: "Text", cssVar: "--page-fg" },
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

export function colorVars(colors: PageColors): CSSProperties {
  return Object.fromEntries(
    Object.entries(colors).map(([role, hex]) => [
      colorRoles[role as ColorRoleKey].cssVar,
      hex,
    ]),
  );
}

type FieldSpec = {
  key: string;
  label: string;
  type?: "number";
  hint?: string;
};

// Content sections hold copy and lists. Sections with `fields` are built by the
// page from live data (events, posts, films), and the fields are the words
// around it.
export const sectionKinds = {
  text: { key: "text", label: "Text" },
  links: { key: "links", label: "Links" },
  tags: { key: "tags", label: "Tags" },
  faq: { key: "faq", label: "Dropdowns" },
  hero: {
    key: "hero",
    label: "Banner",
    fields: {
      line1: {
        key: "line1",
        label: "Tagline, line 1",
        hint: "On wide screens, lines 1 and 2 share a banner",
      },
      line2: { key: "line2", label: "Tagline, line 2" },
      line3: { key: "line3", label: "Tagline, line 3" },
    },
  },
  events: {
    key: "events",
    label: "Upcoming events",
    fields: {
      featuredLabel: { key: "featuredLabel", label: "Label on the next event" },
      emptyMessage: { key: "emptyMessage", label: "Message when there are no events" },
    },
  },
  eventsPreview: {
    key: "eventsPreview",
    label: "Upcoming events",
    fields: {
      featuredLabel: { key: "featuredLabel", label: "Label on the next event" },
      moreHeading: { key: "moreHeading", label: "Heading over the events after it" },
      count: { key: "count", label: "How many events after it", type: "number" },
      viewAllLabel: { key: "viewAllLabel", label: "Link to the Events page" },
    },
  },
  posts: {
    key: "posts",
    label: "Newsletter posts",
    fields: {
      subscribeLabel: { key: "subscribeLabel", label: "Subscribe button" },
      latestLabel: { key: "latestLabel", label: "Label on the latest post" },
      olderHeading: { key: "olderHeading", label: "Heading over older posts" },
      emptyMessage: { key: "emptyMessage", label: "Message when there are no posts" },
    },
  },
  watching: {
    key: "watching",
    label: "Letterboxd",
    fields: {
      heading: { key: "heading", label: "Heading" },
      count: { key: "count", label: "How many films", type: "number" },
      followTitle: { key: "followTitle", label: "Follow tile title" },
      followSubtitle: { key: "followSubtitle", label: "Follow tile subtitle" },
    },
  },
} as const satisfies Record<
  string,
  { key: string; label: string; fields?: Record<string, FieldSpec> }
>;

export type SectionKind = keyof typeof sectionKinds;
export type FieldsKind = {
  [K in SectionKind]: (typeof sectionKinds)[K] extends { fields: object }
    ? K
    : never;
}[SectionKind];

export function isFieldsKind(kind: SectionKind): kind is FieldsKind {
  return "fields" in sectionKinds[kind];
}

type SectionTemplate = {
  key: string;
  label: string;
  kind: SectionKind;
  // Colors this section with another page's colors instead of its own page's
  colorsFrom?: string;
  // What one item in a list is called, for buttons like "Add question"
  item?: string;
};

type PageTemplate = {
  key: string;
  label: string;
  href: string;
  subtitle: boolean;
  sections: Record<string, SectionTemplate>;
};

// The structure of each page, in render order. Labels here only name things in
// the admin; everything shown on the page (titles, headings, content, colors)
// lives in Firestore at pages/{key}.
export const pageTemplates = {
  home: {
    key: "home",
    label: "Home",
    href: "/",
    subtitle: false,
    sections: {
      hero: { key: "hero", label: "Banner", kind: "hero" },
      events: {
        key: "events",
        label: "Upcoming events",
        kind: "eventsPreview",
        colorsFrom: "events",
      },
      watching: { key: "watching", label: "Recently watched", kind: "watching" },
    },
  },
  events: {
    key: "events",
    label: "Events",
    href: "/events",
    subtitle: true,
    sections: {
      upcoming: { key: "upcoming", label: "Upcoming events", kind: "events" },
      intro: { key: "intro", label: "Intro", kind: "text" },
      types: { key: "types", label: "Event types", kind: "faq", item: "event type" },
    },
  },
  blog: {
    key: "blog",
    label: "Blog",
    href: "/blog",
    subtitle: true,
    sections: {
      posts: { key: "posts", label: "Posts", kind: "posts" },
    },
  },
  about: {
    key: "about",
    label: "About",
    href: "/about",
    subtitle: false,
    sections: {
      intro: { key: "intro", label: "Intro", kind: "text" },
      mission: { key: "mission", label: "Mission", kind: "text" },
      news: { key: "news", label: "In the News", kind: "links", item: "link" },
      follow: { key: "follow", label: "Follow Us", kind: "text" },
      faq: { key: "faq", label: "FAQ", kind: "faq", item: "question" },
      conduct: { key: "conduct", label: "Code of Conduct", kind: "text" },
    },
  },
  partnerships: {
    key: "partnerships",
    label: "Partnerships",
    href: "/partnerships",
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

export function sectionTemplate(page: PageKey, key: string) {
  const sections: Record<string, SectionTemplate> = pageTemplates[page].sections;
  return sections[key];
}

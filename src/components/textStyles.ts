// A relative import, so markdownStyles.test.ts can load this under node
import { cn } from "../lib/utils.ts";

// The kinds of text on the site, each with its color role (see colorRoles)
// and the sizes and strengths that go with it. Text on the page background is
// in Page text, text on the cream cards in Card text, and lettering is cream
// outlined in Lettering outline. Faded text on cards steps down to 80%, the
// strength the admin checks Card text's contrast at.

const lettering =
  "uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink";

const proseHeading = "uppercase tracking-wider text-page-card-text";

const proseLink =
  "text-rust underline decoration-rust/40 underline-offset-4 hover:decoration-rust";

const buttonLabel = "uppercase tracking-wider whitespace-nowrap";

const stickerText = "text-sm uppercase leading-none tracking-wider";

export const textStyles = {
  pageHeading: "text-xl uppercase tracking-wide text-page-fg sm:text-2xl",
  pageSubtitle: "text-lg uppercase tracking-wide text-page-fg/80",

  titleLettering: cn("text-5xl sm:text-6xl", lettering),
  labelLettering: cn("text-4xl sm:text-5xl", lettering),

  cardTitle:
    "text-2xl uppercase leading-tight tracking-wide text-page-card-text sm:text-3xl",
  tileTitle:
    "text-base uppercase leading-tight tracking-wide text-page-card-text sm:text-lg",
  cardQuestion:
    "text-xl uppercase leading-snug tracking-wider text-page-card-text sm:text-2xl",
  cardMeta: "text-sm uppercase tracking-wider text-page-card-text/80",
  tileMeta: "text-xs uppercase tracking-wider text-page-card-text/80",
  cardDek: "text-lg text-page-card-text/80",
  // Also captions
  tileDek: "text-sm text-page-card-text/80",
  // Short HTML, like an event's description
  cardNote: "text-sm text-page-card-text/90",
  cardEmpty:
    "text-center text-lg uppercase tracking-wide text-page-card-text/80",

  proseBody: "text-base leading-[1.6] tracking-[0.04em] text-page-card-text/90",
  proseLink,
  // proseLink for the links inside HTML
  htmlLinks:
    "[&_a]:text-rust [&_a]:underline [&_a]:decoration-rust/40 [&_a]:underline-offset-4 [&_a]:hover:decoration-rust",

  // Button labels by the button's size (see Pill), which also sets their color
  buttonSmall: cn("text-xs", buttonLabel),
  button: cn("text-sm", buttonLabel),
  buttonLarge: cn("text-sm sm:text-base", buttonLabel),

  // Charcoal whatever the page, since stickers are cream on any card or page
  stickerText: cn(stickerText, "text-charcoal"),
  stickerDate: cn(stickerText, "text-charcoal/80"),
} as const;

// Each level's size and the space above it, the same in Markdown and in HTML
export const proseHeadings = {
  h1: cn("mt-12 text-3xl", proseHeading),
  h2: cn("mt-10 text-[1.75rem]", proseHeading),
  h3: cn("mt-8 text-2xl", proseHeading),
  h4: cn("mt-6 text-xl", proseHeading),
} as const;

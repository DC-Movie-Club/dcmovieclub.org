# DC Movie Club Design Guide

The site looks hand-made: cream cards with wobbling ink edges, lettering
stamped in outline, buttons that shudder when you touch them. This guide is
the reference for how that look is built, as components, so a new page or
feature is assembled from them rather than redrawn.

The system has three layers, and code only reaches down one:

1. **Effects**: the SVG filters (`system/filters.ts`) and the CSS utilities
   that point at them (`sketch`, `ink`, `boil`, in `globals.css`), plus
   `focus-ring` and the type styles in `textStyles`.
2. **Primitives** (`src/components/system/`): buttons, stickers, cards,
   tiles, dialogs, links, built from the effects.
3. **Layout and features** (`layout/`, `pages/`, `sections/`, `home/`,
   `events/`, `posts/`): built from primitives, never from raw effects.

A test (`system/boundaries.test.ts`, part of `pnpm test`) fails if effect
classes, `focus-ring` or `target` attributes show up outside `system/` (the
bottom nav and its logo are the one exception: they keep their own system).

Every page renders at `/kit` in development from made-up data
(`src/app/kit/fixtures.ts`), and `pnpm kit:check` compares screenshots of
them, exactly, against a baseline taken with `pnpm kit:baseline`. See
[Checking a change](#checking-a-change).

---

## Brand

The aesthetic is **hand-made, indie and analog**: a film society zine, a
linocut print, a poster wheat-pasted outside an arthouse cinema. Warm,
tactile, community-driven.

**Keywords:** DIY, hand-drawn, linocut, vintage cinema, zine, arthouse,
community, film-nerd authentic

**Illustration** follows a linocut or woodblock print: black and white, high
contrast, hand-carved textured lines rather than clean vectors. The audience
in theatre seats is a recurring motif; the red curtain is painterly, not
photographic.

---

## Color

### Page colors

Each page has its own colors, set by admins in Firestore (picked from the
brand swatches the admin edits) as eight roles. Components color with the
roles, never with a page's hex values, so any page can take any palette.

| Role (admin label) | Utility color | What takes it |
|---|---|---|
| Background | `page-bg` | The page, the fade under the nav |
| Page text | `page-fg` | Headings and text on the background, outline and ghost buttons, the focus ring |
| Card text | `page-card-text` | All text on cream cards and tiles (unset: the lettering outline) |
| Lettering outline | `page-ink` | The outline on cream lettering: page titles, card labels |
| Card border | `page-edge` | Card and tile edges |
| Accent | `page-accent` | Filled buttons, the tagline strips |
| Accent border | `page-accent-edge` | Their edges, the hover wash over tiles and posters, a linked card's edge on hover |
| Accent text | `page-accent-text` | Text on the accent |

Roles are CSS variables (`--page-bg`, …) set by `colorVars` on a page's
`PageShell` or a `ColorBand`. An unset role falls back to a neutral color
(the default background, cream for accent text, charcoal for the rest; card
text first tries the lettering outline), and `colorVars` resets every role
it doesn't set, so a band in one page's colors never shows another's.

In custom CSS read the variable, not the utility color:
`var(--page-fg, var(--color-charcoal))`. `--color-page-fg` is resolved where
the theme is defined, at the root, where no page has set it.

### Fixed colors

Some things look the same on every page:

- **Cream** (`cream`, `#efecdf`): cards, tiles, stickers, dialogs
- **Charcoal** (`charcoal`, `#393a3e`): sticker text, poster frames
- **Rust** (`rust`, `#a2390a`): links in text, the focus ring on cream
- **Background** (`background`, `#f5f3e8`): the page under everything, and a
  page's background when it sets none

### Brand palette

The named colors in `globals.css`. Pages don't pick from these (they pick
from the swatches in Firestore); components use the few above.

| Name | Hex | | Name | Hex |
|---|---|---|---|---|
| `rust` | `#a2390a` | | `rose` | `#ca6c84` |
| `rust-dark` | `#551e05` | | `orange` | `#eca344` |
| `sienna` | `#b24d2a` | | `olive` | `#b1ad26` |
| `cream` | `#efecdf` | | `sky` | `#57a7cc` |
| `teal` | `#375b6d` | | `purple` | `#6372af` |
| `charcoal` | `#393a3e` | | `logo-red` | `#9e2726` |

`sticker-back` and `sticker-back-shade` color the paper back of a peeled
sticker. The semantic colors (`primary`, `muted`, `border`, …) are shadcn's,
for the admin; they alias the brand colors.

---

## Type

DCMC, the custom face, is the only font on the public site. Every kind of
text has a style in `system/textStyles.ts`, which sets its size, case,
tracking and color role together; feature code uses those instead of
writing type classes.

| Style | For |
|---|---|
| `titleLettering` | A page's title: cream, outlined in the page's ink |
| `labelLettering` | A card's label on its top edge, or a heading over a list of cards |
| `pageHeading`, `pageSubtitle` | Headings and subtitles on the page background |
| `cardTitle`, `cardQuestion`, `tileTitle` | Titles on cards and tiles |
| `cardMeta`, `tileMeta` | Dates, places, names |
| `cardDek`, `tileDek`, `cardNote` | Short descriptions |
| `cardEmpty` | "Nothing here yet" |
| `quote`, `quoteLong` | A review on a card, short or long |
| `dialogTitle` | A dialog's heading |
| `proseBody`, `proseLink`, `htmlLinks`, `proseHeadings` | Running text (with `markdownStyles`) |
| `button`, `buttonSmall`, `buttonLarge` | Button labels, by Pill size |
| `stickerText`, `stickerDate` | Stickers |
| `overlayCaption` | The caption on a hover wash |
| `footerLinks`, `footerNote` | The footer |

Text on the page background is in Page text; text on cream is in Card text.
Faded text on cards steps down to 80%, the strength the admin checks Card
text's contrast at. Headings are uppercase, with wide tracking.

---

## The hand-drawn look

### Wobble, ink, redraw, boil

| Utility | What it does |
|---|---|
| `sketch`, `sketch-subtle` | The wobble: the shape's edge displaced by noise, 3px (bold) or 1.4px (fine). For fills. |
| `ink`, `ink-subtle`, `ink-fine` | The wobble drawn as a brush pen line that swells and thins. For single-color lines only: it dilates the color, which would smear neighbors. |
| `sketch-animated`, `sketch-subtle-animated` | The redraw: the wobble re-rolled ten times a second. Text and icon links on hover. |
| `boil-sm`, `boil`, `boil-lg` | A shudder on top of whatever wobble the element has. Buttons, posters and the nav on hover. |

A sketched shape is a **fill** under `sketch` with a **line** over it under
`ink`, at the same weight so the fill stays under the line wherever it
moves. `SketchShape` draws that pair and its `weight` (`bold` or `fine`)
picks both filters, so they can't mismatch.

The filters are defined once, in `system/filters.ts`. `SketchFilter` (in
`PublicChrome`, and in the admin's page preview) renders them as shared
defs; `CardSurface` draws a tall card's edge as strips, each in its own
short filter, because filtering a whole tall card stalls scrolling on phones.

The boil variables don't inherit, so a boiling parent leaves its children
be.

### Hover variants

- `hover:` also applies while pressed (`:active`), so touch screens get it.
- `parent-hover:` styles a control's own layers (a Pill's fill and line)
  from hovering the control, so a control inside another reacts only to its
  own hover. Prefer it to naming a `group/*` per control.
- `card-hover:` styles things on a card (its corner button) while the card
  is hovered, but not while hovering a button inside the card.

### Idioms

One hover per kind of element:

- **Buttons** (Pill) boil and grow a little on hover and press.
- **Text links** (TextLink) turn rust and redraw. In the footer they turn
  the page's text color, since rust doesn't show on every page.
- **Icon links** (IconLink, SocialLinks) rest in the fine pencil line and
  redraw on hover.
- **Tiles** tilt and grow. One that opens another site turns its edge the
  accent edge and shows the hover wash, an arrow on the accent edge color.
- **Posters** tilt, grow and boil, with the wash and the film's title.
- **Whole-card links** turn the card's edge and label the accent edge.

Corner actions boil with their card, and the nav has its own system; those
differences are deliberate.

### Focus

`focus-ring` draws a 2px outline on keyboard focus in the page's text
color, which shows on the page background. On cream it's rust:
`focus-ring-rust` sets it, and the cream Pill, `SketchDialogContent` (for
everything inside it) and `DisclosureCard` already do. `--focus-offset`
spaces it further out. Only primitives set it.

### Links

`SmartLink` picks how a link opens from its address: a page on this site
through Next's router, `mailto:`, `tel:` and `#` as plain links, anywhere
else in a new tab with `rel="noopener noreferrer"` (see `linkKind` in
`lib/external-links.ts`). Nothing else sets `target`. Links in Markdown
render as TextLinks; HTML (event descriptions, Substack posts) gets the same
treatment through `withExternalLinks`.

---

## Primitives

All in `src/components/system/`.

### Shapes

- **SketchShape**: the fill and line pair. `weight` (`bold`, `fine`),
  `radius`, `fill` and `line` classes, `hardShadow` (an offset copy, since a
  box-shadow would be clipped by the filter), `hover` (styles both layers).
  Render it first inside a `relative` element; content after it is
  `relative`.
- **CardSurface**: a card's cream face and bold edge, in strips.
- **SketchImage**: a picture with a line over its edge, the picture wobbling
  with the line. Shown whole over a blur of itself. Uses **ThumbnailImage**.

### Controls

- **Pill**: the button. Variants:
  - `accent`: filled in the page's accent, bold line, shadow. The page's
    main action.
  - `outline`: the page's text color; fills with it on hover, the text
    taking the background's.
  - `ghost`: no line, a tint on hover. The "← Home" link.
  - `cream`: cream on any page, for small controls on cream (a dialog's
    close, Read more).

  Sizes `sm`, `md` (default), `lg`. `round` makes an icon-only circle;
  `icon` and `iconEnd` add icons. With `href` it's a link (through
  SmartLink), otherwise a button. `render` renders it as another element,
  and it passes on props and ref, so it works as a Base UI `render` target;
  give it its content directly there. `withCard` makes it boil with the
  card it's on; `decorative` draws it as a plain span inside another
  control.
- **CardAction**: an accent Pill on a card's top-right corner.
- **Sticker**: the cream chip with a faint edge, the same on any page:
  dates, ratings, partner names.
- **SketchIcon**: an icon in the pencil line (fine unless large); `redraw`
  redraws it on its parent's or its tile's hover.
- **SmartLink**, **TextLink**: see [Links](#links). TextLink is for links in
  running text.
- **IconLink**, **SocialLinks**: an icon link named by its label, and the
  club's accounts as a row of them.
- **ExpandableDescription**: long HTML clipped with a fade and a cream "Read
  more" Pill; it opens in one step and fades the rest in.

### Surfaces

- **Card**: the cream card. `label` sits on its top edge in outlined
  lettering (tilted less the longer it is), `action` is a CardAction, `link`
  makes the whole card clickable (an element stretched under the content),
  and its content gets the card's padding unless `padded={false}`.
- **DisclosureCard**: a card with a question that opens to its answer, with
  a round + badge that turns to a cross.
- **Tile**: the small cream card in a grid. Linked by `href` (or `render`
  for an element like EventCtaLink) it tilts on hover; `opens` adds the hover
  wash; `badge` sits over everything.
- **LinkOverlay**: the hover wash with an arrow and optional caption, used
  by Tile and PosterFrame.
- **PosterFrame**, **PosterCard**: a film poster in a charcoal frame, and a
  cream card the size of one.
- **SketchDialogContent**: the public dialog's popup: cream, a faint edge, a
  round close button on its corner, rust focus inside. Dialogs that portal
  out of a page copy its color roles (see TicketsDialog).
- **CalendarDate**: the tear-off date, `tall` or `wide`.

### Text

- **textStyles**, **markdownStyles**: see [Type](#type).
- **Markdown**: admin-written copy, styled as prose, with YouTube links as
  embeds (**YouTubeEmbed**) and `<details>` blocks. Raw HTML is ignored.

---

## Layout

In `src/components/layout/`.

- **PublicChrome**: what every public page sits in: the filter defs, the
  page, the bottom nav, and PageReveal (which holds the entrance until the
  page is laid out). Used by the public layout, the 404 page and `/kit`.
- **PageShell**: a page in its color roles, its background to the bottom
  edge, the footer (at the bottom of the screen on a short page), and room
  for the nav at the end.
- **PageHeader**: the "← Home" link, the title, an optional subtitle and an
  optional button at the end of the row. A title with a word too long for a
  small phone steps down a size there.
- **PageContent**: the column of sections under the header: 32px below it
  (more when the first card's label overhangs its top edge), sections 56px
  apart (64px on pages whose cards all have labels).
- **Container**: the site's column: up to 48rem of content, centered, with
  1.5rem gutters.
- **ColorBand**: a full-width band in another page's colors, as on the home
  page.
- **SectionHeader**: a heading on the page with an optional button at the
  end of its row.
- **TileGrid**: tiles in 2 or 3 columns from `sm` up, one per row on phones;
  `badged` leaves room for badges over the tiles' top edges.
- **EmptyState**: a card standing in for an empty list.
- **SiteFooter**, **BottomNav**, **HomeLink**, **PageReveal**: the chrome.

A content page is:

```tsx
<PageShell colors={page.colors}>
  <PageHeader title={page.title} subtitle={page.subtitle} />
  <PageContent className="mt-14">
    <FeaturedEventCard event={featured} />
    <PageSections sections={page.sections} />
  </PageContent>
</PageShell>
```

### Folders

| Folder | What's in it |
|---|---|
| `system/` | Primitives, the type styles, the filters |
| `layout/` | Page structure and chrome |
| `logo/` | The lettering, the nav's outline logo and their shapes |
| `pages/` | One component per page, and PageBody, which picks one |
| `sections/` | The editable sections pages are made of |
| `home/`, `events/`, `posts/` | Feature code by area |
| `icons/` | Brand icons lucide doesn't have |
| `ui/` | shadcn components, for the admin |

### Sizes

- Breakpoints: `xs` 500px, `sm` 640px, `md` 768px. The bottom nav spans the
  screen on phones and floats as a pill from `xs`.
- The column: 48rem, 1.5rem gutters.
- Home's bands: 64px above their content, 56px below.
- The footer: 80px below the content; the page ends 144px below it, clear of
  the nav.

---

## Checking a change

1. On the commit before the change, `pnpm kit:baseline` screenshots every
   `/kit` page (top and whole, phone and desktop), open dialogs and
   disclosures, keyboard focus and hovers.
2. After it, `pnpm kit:check` compares them exactly. Differences land in
   `test-results/` as expected, actual and diff images.
3. `pnpm test` runs the unit tests and the boundaries test; `pnpm lint` and
   `npx tsc --noEmit` the rest.

To compare against another commit side by side, serve it from a second
checkout and point the spec at it with `KIT_URL` (and `KIT_SHOTS` for a
separate folder). Restart a dev server after switching commits under it,
since Turbopack doesn't always rebuild the CSS. Playwright needs its browser
once: `pnpm exec playwright install chromium`.

A new state worth checking (a variant, an empty list) goes in the fixtures
and the spec.

---

## Do and don't

**Do**

- Build from primitives; add a variant to one before writing a one-off.
- Color with the page's roles, so any palette works.
- Keep rough edges: wobble, overlap, tilt.
- Use theatre and cinema motifs: curtains, marquees, audiences, film strips.

**Don't**

- Use raw effect, focus or `target` classes outside `system/`.
- Write type classes in feature code; add a style to `textStyles`.
- Use pure white or black: cream and charcoal instead.
- Add smooth gradients, glassy effects or crisp drop shadows that fight the
  hand-made look.

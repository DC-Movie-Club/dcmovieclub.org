# Design System Cleanup

The site's hand-drawn look lives in CSS utilities (`sketch`, `ink`, `boil`) and
`textStyles`, with no component layer above them. Every button, chip, tile and
card assembles the same layers by hand, and the copies have drifted. This
project adds that layer, moves the public site onto it in phases checked
against screenshots, and leaves the performance work (see the end) as
one-place changes.

## Decisions

1. **Converge where possible.** Snap drifted copies to a small set of variants,
   but keep differences that are deliberate: the two ink weights (bold and
   fine wobble scales) and hover effects that differ on purpose (corner
   actions boil with their card, nav items have their own system).
2. **One hover idiom per kind of element.**
   - Buttons (accent, outline, ghost, cream, round) boil on hover and press.
     The "← Home" link is a ghost button.
   - Text links shift color and redraw (`sketch-subtle-animated`).
   - Icon links rest in the fine pencil line and redraw on hover.
3. **The FAQ snaps open** and fades its text in, like Read more, so it can be
   an ordinary card.
4. **One sticker.** Partner names, tags, post dates and poster stickers all use
   the cream sticker with a faded charcoal edge.
5. **Contact and Instagram pages are removed.** They were unlinked
   placeholders (the nav and footer mail us directly). The 404 page stays and
   moves onto the shared chrome.

Defaults: admin dialogs go back to plain shadcn, folder moves happen last as
pure renames.

## What was duplicated

The core shape is a fill layer under `sketch` with a line layer under `ink`,
at the same wobble scale so the fill stays under the line. It was assembled by
hand in about 18 places across 14 files.

- Filled accent pill: 4 copies (CardEdgeFace, SubscribeButton, footer
  subscribe, Partner with us), differing in border width, shadow, padding and
  tracking
- Outline pill: 2 (OutlineLink, FollowButton)
- Cream round button: 2 identical (CornerCloseButton, Read more toggle)
- Sticker: 4 (DatePill, PosterSticker, home partner chips, TagItem)
- Tile: 3 (LinkCard, EventTile, PostTile) plus the FAQ card drawn with
  ::before/::after
- Card padding around CardSurface: 4 different sets
- Hover "opens" overlay: 2 (OpensOverlay, poster overlay with a hard-coded hex)
- Offset hard shadow: 2 (tagline strips, tall CalendarDate)
- Social icon row: 3 (hero, footer, More menu), each hovering differently
- External links: 10 hand-written `target="_blank"`; the internal/external
  check written 3 times
- Focus ring: 14 hand-written (8 cream, 6 rust)
- Hover wiring: 14 `group/*` names, one per control
- Page shell: ColorPage, Home's own wrapper, ad hoc Contact/Instagram/404
- Home color bands (3), section header with action (4), tile grid (4), empty
  card (2)
- Filters: the ink chain written twice (SketchFilter string, CardSurface JSX);
  WatercolorFilter mounted but unused

## Target structure

1. **Effects**: filter definitions (`filters.ts`, one source for the global
   defs and CardSurface's strips) and the CSS utilities. Only primitives use
   them.
2. **Primitives** (`components/system/`): the design system as components.
3. **Layout and features**: built from primitives. No raw `sketch`/`ink`/
   `boil`, focus-ring or `target="_blank"` classes.

### Primitives

- **SketchShape**: the fill + line pair. Shape, fill, edge color and width,
  faded edge, shadow, hard offset shadow, boil level; `weight="bold" | "fine"`
  pairs the fill and line filters so they can't mismatch.
- **Pill**: variants accent, outline, ghost, cream, charcoal outline; sizes;
  optional round shape and icons. Renders a button, internal link or external
  link from `href`, and passes props and ref through to work as a Base UI
  `render` target. Owns hover grow, boil and focus ring. `CardAction` places
  one on a card's corner.
- **Sticker**: the cream chip.
- **Tile**: cream, page-edge ink line, tilt on hover, optional overlay.
- **Card**: CardSurface, one padding scale, optional edge label, corner
  action and whole-card link.
- **LinkOverlay**: the hover wash with an arrow and optional caption.
- **SketchDialogContent**: the public dialog: sketched surface, corner
  close, rust focus inside. (TicketsDialog carries the page's color roles
  into the portal.)
- **SmartLink / TextLink**: one link that picks Next's link or a new-tab `<a>`
  from the href, and a prose-styled one.
- **SocialLinks**: the icon row.

### Layout

- **PublicChrome**: filters, main, nav, PageReveal; shared by the public
  layout and the 404 page.
- **PageShell**: color roles, background to the bottom edge, nav clearance,
  footer. Replaces ColorPage and Home's wrapper. PageHeader carries the
  HomeLink.
- **ColorBand, Container, PageHeader, SectionHeader, TileGrid, EmptyState.**
- BottomNav keeps its own item system and hatched shadow; its bar, menu and
  socials move onto the primitives.

### Tokens and CSS

- `textStyles` stays the type system; inline typography in feature code moves
  into it.
- One `focus-ring` utility; the primitive picks cream (on page colors) or rust
  (on cream).
- Boils triggered by the control's own hover or press, plus `card-hover` for
  corner actions, instead of a group name per control.
- Semantic tokens alias brand variables; hard-coded hexes become tokens;
  unused palette tokens go (the editable palette is the Firestore swatches).

## Phases

Each phase is a commit (or several). While the work was under way each was
checked against exact screenshots of a dev-only `/kit` route that drew every
page from made-up data, taken with Playwright. That harness (the route, its
fixtures, the spec and the Playwright dependency) was removed once the work
was verified; it's in the branch's history if it's ever wanted again.

- [x] **0. Safety net.** The `/kit` route and screenshot spec described
  above: each page top and whole at phone and desktop sizes, open states
  (dialogs, Read more, FAQ), keyboard focus and 23 desktop hovers. Since
  removed.
- [x] **1. Foundations, no visual change.** `system/filters.ts` (one
  definition for the shared defs and CardSurface's strips), PublicChrome,
  `focus-ring`, SmartLink and TextLink (with `linkKind` in
  `lib/external-links.ts`), `routes.contact` as the mailto address; deleted
  WatercolorFilter, `ui/link.tsx`, `lib/constants.ts`, the paragraph icons,
  Contact and Instagram. Screenshots unchanged; every link keeps its href,
  target, rel and classes.
- [x] **2. SketchShape, Pill, Sticker, LinkOverlay, SocialLinks** and their
  call sites; the per-kind hover idioms (buttons boil, text and icon links
  redraw). A `parent-hover` variant replaces the group name per control.
  Converged: one accent button (3px line, shadow), one outline button in the
  page's text color whose hover text takes the page's background, the Home
  link as a ghost button, one cream sticker, the poster overlay in the
  page's accent edge, and the focus ring in the page's text color.
- [x] **3. Tile, Card, SketchDialogContent**, plus SketchImage (post
  covers), PosterFrame/PosterCard and SketchIcon; the FAQ onto Card, opening
  in one step with a fade. Converged: the featured event card's padding, the
  FAQ's corners and line, one dialog cream, the posters' focus ring. The
  latest post keeps its tighter padding (its title needs the room beside the
  cover). ui/dialog is plain again for the admin.
- [x] **4. Layout components** (`components/layout/`): PageShell (color
  roles, background to the bottom edge, footer, nav clearance; the
  `-mb-24` that cancelled `main`'s padding is gone), Container, PageHeader
  (a title with a word too long for a 320px phone steps down a size),
  PageContent, ColorBand, SectionHeader, TileGrid, EmptyState. The 404 page
  is a PageShell page with a PageHeader. Converged on the home page: the
  About band's padding, the rail heading in the page's text color, the
  footer spacing and bottom clearance. The other pages are pixel-identical.
- [x] **5. Text and tokens.** The last inline type in feature code is in
  textStyles (dialog title, quotes, overlay caption, footer); the bottom nav,
  calendar date and hero tagline keep their own. Semantic and shadcn colors
  alias the brand's (pixels identical); the heart sticker's flap has tokens
  (through a `stop-*` utility, since Tailwind doesn't emit a theme variable
  only an arbitrary value uses); unused shades and roles are gone, while the
  brand's named colors stay. Converged: the featured review in card text with
  its reviewer at 80%, the missing-poster card on cream, the tickets
  dialog's title in card text.
- [x] **6. File moves and docs.** First the last raw uses moved into
  primitives (DisclosureCard for the FAQ, the footer panel as a SketchShape,
  SketchDialogContent ringing focus in rust), screenshots unchanged. Then a
  rename-only commit into `system/`, `layout/`, `logo/`, `sections/`,
  `home/`, `events/` and `posts/`. `docs/design-guide.md` is rewritten as the
  component reference, `docs/hand-drawn-borders.md` points at the current
  files, and CLAUDE.md has the rules. `system/boundaries.test.ts` fails when
  effect, focus or `target` classes appear outside `system/` (the bottom nav
  and its logo excepted), and checks that it catches them.

## Bugs found along the way

- Fixed: the Get Tickets pill on an event with several tickets wasn't in
  the tab order (TicketsDialog passed an undefined tabIndex over Base UI's
  default), so keyboard users couldn't open the ticket picker.
- Fixed: the 404 page sat outside the public layout: no filter defs (the
  nav's sketch and ink pointed at nothing) and no PageReveal, so the nav's
  entrance waited for the 3 s fallback. Now in PublicChrome.
- Fixed: the hero's and the More menu's social icons were links with no
  accessible name. SocialLinks names them.
- Fixed: the cover snapshot's frame used `sketch-subtle` where its
  single-color line should use `ink-subtle`.
- Fixed: admin dialogs used the sketched surface from `ui/dialog.tsx`, but
  the filters only exist in admin while a page preview is mounted, so the
  same dialog was sketched in the page editor and flat elsewhere. The
  sketched surface moved to SketchDialogContent.
- The 404 page can't render without Firestore credentials (it fetches the
  nav's colors).

## Afterwards: performance

From the filter benchmark (headless Chromium, CPU raster, 360×640 box at 3×):
`sketch` costs ~9 ms per repaint, `ink` ~41 ms, and cost grows with area; a
boiling element repainted every frame (60/s) though its noise changes 10×/s.

Done (measured on the fixture pages, phone size at DPR 3):

- [x] **Lighter boil**: the boils and redraws step a variable through five
  static filters with CSS keyframes instead of animating the noise with
  SMIL. A hovered element repaints 10 times a second instead of 60: about a
  fifth of the raster work (a hovered poster 5.3 s → 1.0 s over 3 s).
  Screenshots identical.
- [x] **Reduced motion**: with `prefers-reduced-motion`, the boils and
  redraws don't run; a shape keeps its resting wobble.
- [x] **sRGB**: `color-interpolation-filters="sRGB"` on every filter.
  11–24% less raster per full repaint, 7–16% per boil; pixels change by a
  level or two, nothing moves.
- [x] The FAQ's per-frame redraw: gone with decision 3.

Next, if wanted: **strips for tiles.** Filters are 85–93% of a repaint's
raster time, and a tile's ink line is filtered over the whole tile though
it only runs round the edge. Switching tiles' lines off cuts a repaint of
the blog's second screen from 69 ms to 33 ms, the events page's from 42 to
28. Drawing the line in strips, as CardSurface does for cards, would get
most of that back; SketchImage's line and the posters' frames are the same
case at a smaller size.

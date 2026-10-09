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

Defaults: admin dialogs go back to plain shadcn, `/kit` is dev-only (404 in
production), folder moves happen last as pure renames.

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
- **SketchDialog**: the public dialog: sketched surface, corner close, and the
  page's color roles carried into the portal.
- **SmartLink / TextLink**: one link that picks Next's link or a new-tab `<a>`
  from the href, and a prose-styled one.
- **SocialLinks**: the icon row.

### Layout

- **PublicChrome**: filters, main, nav, PageReveal; shared by the public
  layout, the 404 page and `/kit`.
- **PageShell**: color roles, background to the bottom edge, nav clearance,
  optional HomeLink, footer. Replaces ColorPage and Home's wrapper.
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

Each phase is a commit (or several), checked against the `/kit` screenshots
before moving on.

To check a change: on the commit before it, `pnpm kit:baseline`; after it,
`pnpm kit:check`. Differences land in `test-results/` as expected, actual and
diff images. `pnpm dev` and `/kit` show the pages by eye. Locally, Playwright
needs its browser once: `pnpm exec playwright install chromium`.

- [x] **0. Safety net.** Fixture data (`src/app/kit/fixtures.ts`); dev-only
  `/kit` pages rendering every page from fixtures under the real chrome;
  `tests/kit.spec.ts` screenshotting each page (top of page and whole) at
  phone and desktop sizes, plus open states (dialogs, Read more, FAQ) and 23
  desktop hovers, with animations held still.
- [x] **1. Foundations, no visual change.** `system/filters.ts` (one
  definition for the shared defs and CardSurface's strips), PublicChrome,
  `focus-ring`, SmartLink and TextLink (with `linkKind` in
  `lib/external-links.ts`), `routes.contact` as the mailto address; deleted
  WatercolorFilter, `ui/link.tsx`, `lib/constants.ts`, the paragraph icons,
  Contact and Instagram. Screenshots unchanged; every link keeps its href,
  target, rel and classes.
- [ ] **2. SketchShape, Pill, Sticker, LinkOverlay, SocialLinks** and their
  call sites; the per-kind hover idioms.
- [ ] **3. Tile, Card, SketchDialog**; the FAQ onto Card.
- [ ] **4. Layout components**; the 404 page onto PageShell.
- [ ] **5. Text and tokens.**
- [ ] **6. File moves and docs.** Rename-only commit; rewrite
  `docs/design-guide.md` as the component reference; a CLAUDE.md with the
  rules; a node test that fails when effect, focus or new-tab classes appear
  outside `system/`.

## Bugs found along the way

- Fixed: the Get Tickets pill on an event with several tickets wasn't in
  the tab order (TicketsDialog passed an undefined tabIndex over Base UI's
  default), so keyboard users couldn't open the ticket picker.
- Fixed: the 404 page sat outside the public layout: no filter defs (the
  nav's sketch and ink pointed at nothing) and no PageReveal, so the nav's
  entrance waited for the 3 s fallback. Now in PublicChrome.
- The hero's social icons are links with no accessible name. For
  SocialLinks.
- Admin dialogs use the sketched surface from `ui/dialog.tsx`, but the filters
  only exist in admin while a page preview is mounted, so the same dialog is
  sketched in the page editor and flat elsewhere. Fixed by moving the sketched
  surface to SketchDialog.
- The cover snapshot's frame uses `sketch-subtle` where its single-color line
  should use `ink-subtle`.

## Afterwards: performance

From the filter benchmark (headless Chromium, CPU raster, 360×640 box at 3×):
`sketch` costs ~9 ms per repaint, `ink` ~41 ms, and cost grows with area; a
boiling element repaints every frame (60/s) though its noise changes 10×/s.
After the cleanup each fix is one place:

- `color-interpolation-filters="sRGB"` (~1.8× faster plain wobble) and any
  noise changes: `filters.ts`
- Reduced motion: the `boil` utility
- Strips vs whole-box filter: per primitive (Card already uses strips)
- The FAQ's per-frame redraw: gone with decision 3
- SMIL vs CSS-stepped boil: one filter definition

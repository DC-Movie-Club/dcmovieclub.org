# DC Movie Club

The club's site: Next.js 16 (App Router, Turbopack), React 19, Tailwind v4,
Base UI, with content in Firestore and an admin at `/admin`. pnpm 11.

## Commands

- `pnpm dev`: the site
- `pnpm test`: unit tests, and the design system's boundaries test
- `pnpm lint`, `npx tsc --noEmit`

## The design system

`docs/design-guide.md` is the reference. The rules:

- Public pages are built from the primitives in `src/components/system/` and
  the layout in `src/components/layout/`. Add a variant to a primitive before
  writing a one-off.
- The effect utilities (`sketch*`, `ink*`, `boil*`), `focus-ring*` and
  `target` attributes only appear in `system/` (the bottom nav and its logo
  excepted). `system/boundaries.test.ts` enforces it.
- Type comes from `textStyles`; colors from the page's color roles
  (`page-bg`, `page-fg`, `page-card-text`, …), or cream, charcoal and rust
  for things that look the same on every page.
- Links go through `SmartLink` (or `TextLink` in running text), which picks
  Next's router or a new tab from the address.
- One hover per kind of element: buttons boil, text links turn rust and
  redraw, icon links redraw.
- A visual change is checked in the browser, and a deliberate difference is
  called out in the commit.

## Gotchas

- In custom CSS read a page color's variable (`var(--page-fg,
  var(--color-charcoal))`), not `--color-page-fg`, which `@theme inline`
  resolves at the root.
- Tailwind doesn't emit a theme variable used only inside an arbitrary value
  like `[stop-color:var(--color-x)]`; give it a utility (see `stop-*` and
  `outline-ink-*` in `globals.css`).
- A component made in a server component and passed as a Base UI `render`
  prop arrives already rendered: give its content to it, not to the Base UI
  part.
- Turbopack sometimes keeps serving old CSS after files move or a commit is
  checked out: restart `pnpm dev` with `.next` removed.
- The 404 page fetches the nav's colors from Firestore, so it only renders
  with Firebase credentials.

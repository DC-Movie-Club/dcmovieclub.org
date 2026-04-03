# DC Movie Club Design Guide

## Brand Identity

DC Movie Club's aesthetic is **hand-made, indie, and analog**. Everything should feel like it was crafted by hand — like a film society zine, a linocut print, or a poster wheat-pasted outside an arthouse cinema. The brand is warm, tactile, community-driven, and proudly analog in a digital world.

**Keywords:** DIY, hand-drawn, linocut, vintage cinema, zine, arthouse, community, film-nerd authentic

---

## Color Palette

### Main Colors

| Name          | Hex       | Usage                                          |
|---------------|-----------|-------------------------------------------------|
| Rust          | `#a2390a` | Primary brand color — logos, headings, CTAs      |
| Sienna        | `#b24d2a` | Warm accent — borders, highlights, hover states  |
| Cream         | `#efecdf` | Light backgrounds, text on dark surfaces         |
| Dark Teal     | `#375b6d` | Secondary brand color — alternate logo, links    |
| Charcoal      | `#393a3e` | Dark backgrounds, body text on light surfaces    |

### Secondary Colors

| Name          | Hex       | Usage                                          |
|---------------|-----------|-------------------------------------------------|
| Rose          | `#ca6c84` | Accents, tags, decorative elements               |
| Orange        | `#eca344` | Warnings, highlights, playful accents            |
| Olive         | `#b1ad26` | Accents, badges                                  |
| Sky Blue      | `#57a7cc` | Links, info states                               |
| Purple        | `#6372af` | Accents, category markers                        |

### Semantic Mapping

- **Background:** Cream `#efecdf` (default — light, warm, papery)
- **Surface:** Lighter cream `#f5f3e8` for raised cards or inset areas
- **Foreground/Text:** Charcoal `#393a3e` on light backgrounds
- **Primary:** Rust `#a2390a`
- **Secondary:** Dark Teal `#375b6d`
- **Muted:** Warm grey-cream `#e2dfd2` for subdued backgrounds; `#6b6b70` for subdued text
- **Borders:** Sienna `#b24d2a` at low opacity (`border-sienna/20`)
- **Inverted sections:** Charcoal `#393a3e` background with cream text — use sparingly for contrast (e.g. nav bars, hero banners, footers)
- **Destructive/Error:** Rose `#ca6c84`
- **Success:** Olive `#b1ad26`

---

## Typography

### Fonts

| Token        | Font                          | Usage                              |
|--------------|-------------------------------|------------------------------------|
| `font-dcmc`  | DCMC (custom), Georgia, serif | Default body font — used everywhere |
| `font-sans`  | system-ui, sans-serif         | UI elements where legibility at small sizes matters |
| `font-mono`  | ui-monospace, monospace       | Code, metadata, technical info     |

### Type Scale

- **Display/Hero:** `text-4xl` to `text-6xl` in `font-dcmc`, uppercase, loose tracking (`tracking-wide`)
- **Section Headings:** `text-2xl` to `text-3xl` in `font-dcmc`, uppercase
- **Card Titles:** `text-lg` to `text-xl` in `font-dcmc`
- **Body:** `text-base` in `font-sans`
- **Captions/Meta:** `text-sm` in `font-sans`, `text-muted-foreground`

### Guidelines

- DCMC is the **default font** for the entire site — it's the brand voice and sets the hand-made tone.
- Use `font-sans` only where small-size legibility is critical (e.g. fine print, form validation messages, dense metadata).
- Headings should generally be **uppercase** to match the hand-stamped logo style.
- Favor `tracking-wide` on headings.

---

## Illustration Style

All custom illustrations follow a **linocut / woodblock print** aesthetic:

- **Black and white only** — high contrast, no gradients
- **Hand-carved, textured lines** — not clean vectors
- Subjects are rendered as bold, expressive scenes (movie stills reimagined as prints)
- The audience illustration (people in theatre seats) is a recurring brand motif
- The red theatre curtain texture is painterly, brushstroke-heavy — not photographic

When commissioning or creating new illustrations, they should look like they were carved into a block and stamped onto paper.

---

## UI Components

### Buttons

**Primary (CTA):**
- `bg-rust text-cream` with slight rounding (`rounded`)
- Hover: `bg-sienna`
- Use `font-dcmc uppercase tracking-wide` for button labels

**Secondary/Ghost:**
- `border border-sienna text-charcoal bg-transparent`
- Hover: `bg-sienna/10`

**Link-style:**
- `text-teal underline underline-offset-4`
- Hover: `text-sky`

### Cards

Film cards and content cards should feel like **printed ephemera**:

- Cream or surface background (`bg-surface` or `bg-background`)
- Subtle border (`border border-sienna/20`)
- Image on top, content below
- Title in `font-dcmc uppercase`
- Metadata (director, year, runtime) in `font-sans text-sm text-muted-foreground`
- CTA link at bottom
- Inverted variant: `bg-charcoal text-cream` for featured/highlighted cards

### Navigation

- Can be inverted (`bg-charcoal text-cream`) for contrast against the light page
- Nav items: icon + uppercase label in `font-dcmc`
- Active state: highlighted with brand accent (rust/sienna)
- Consider a decorative active indicator — a notch, underline, or hand-drawn-style marker

### Inputs

- Light background with sienna border (`border-sienna/40`)
- Charcoal text, muted placeholder
- Labels in `font-sans text-sm`
- Focus: brighter border (`border-rust`)

---

## Layout Principles

1. **Light and warm:** Cream backgrounds are the default canvas — like paper or a zine page. Use inverted (dark) sections sparingly for emphasis (nav, footer, hero banners).
2. **Full-bleed imagery:** Hero images and banners should span the full viewport width. Let photography breathe.
3. **Single-column content:** On mobile, everything stacks. Don't force multi-column layouts at small sizes.
4. **Generous vertical spacing:** Sections should feel unhurried. Use `py-12` to `py-20` between major sections.
5. **Theatre metaphors:** Curtain textures, marquee-style type, audience motifs. The UI should evoke the experience of going to the movies.
6. **Handmade over polished:** Rough edges are intentional. Avoid overly precise drop shadows, smooth gradients, or corporate-clean whitespace. If something looks too "designed," it's off-brand.

---

## Spacing & Sizing

| Context            | Value                  |
|--------------------|------------------------|
| Page max-width     | `max-w-4xl` (56rem)    |
| Section padding    | `py-12` to `py-20`     |
| Card gap           | `gap-6` to `gap-8`     |
| Content padding    | `px-4` (mobile), `px-6` (tablet+) |
| Nav height (mobile)| `h-16` to `h-20`       |
| Nav width (sidebar)| `w-20` to `w-24`       |

---

## Responsive Breakpoints

| Breakpoint | Behavior                                    |
|------------|---------------------------------------------|
| < 640px    | Single column, bottom nav bar, stacked cards |
| 640-1024px | Bottom nav shifts to left sidebar, 2-col grids possible |
| > 1024px   | Full sidebar, wider content area, multi-col grids |

---

## Do / Don't

**Do:**
- Use the DCMC font for personality and brand recognition
- Lean into the hand-made, imperfect, analog feeling
- Use dark backgrounds as the default canvas
- Reference theatre/cinema metaphors (curtains, marquees, audiences, film strips)
- Keep the palette warm and earthy

**Don't:**
- Make things look too clean, corporate, or startup-y
- Use pure white (`#fff`) or pure black (`#000`) backgrounds — use cream (`#efecdf`) and charcoal (`#393a3e`) instead
- Use smooth gradients or glass-morphism effects
- Default to dark mode — the brand lives on warm, light, papery backgrounds
- Add unnecessary visual polish that fights the DIY aesthetic

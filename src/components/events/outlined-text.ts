import type { CSSProperties } from "react";

// Poster-style lettering: an outline plus a stacked hard shadow, both drawn in
// `--outline-ink` so a parent state (e.g. hover) can recolor them together.
export const outlinedTextStyle: CSSProperties = {
  textShadow: [
    "2px 2px 0 var(--outline-ink)",
    "3px 3px 0 var(--outline-ink)",
    "4px 4px 0 var(--outline-ink)",
    "5px 5px 0 var(--outline-ink)",
  ].join(", "),
  WebkitTextStroke: "1.5px var(--outline-ink)",
  paintOrder: "stroke fill",
};

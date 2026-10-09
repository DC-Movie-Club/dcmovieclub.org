import { cn } from "@/lib/utils";

// How heavily a shape wobbles. Its fill and its line take the same weight, so
// the fill's edge stays under the line wherever the wobble moves it.
const WEIGHTS = {
  bold: { key: "bold", fill: "sketch", line: "ink" },
  fine: { key: "fine", fill: "sketch-subtle", line: "ink-subtle" },
} as const;

export type SketchWeight = keyof typeof WEIGHTS;

// The fill's wobble, for something drawn inside a shape of that weight, like
// a picture under its line
export function wobbleClass(weight: SketchWeight) {
  return WEIGHTS[weight].fill;
}

// A hand-drawn shape filling its positioned parent: a fill, a line over it in
// brush pen ink, and a hard shadow under it, each optional and each given as
// classes. The ink line only suits one color on a clear ground, so the fill
// is its own layer, set just inside the line, which the ink thins in places.
// A faint line is drawn solid and faded with opacity, since ink cuts away a
// translucent one. Render it first, with the content after it `relative`.
// `hover` styles both layers, like a control's boil.
export function SketchShape({
  weight = "bold",
  radius = "rounded-full",
  fill,
  line,
  hardShadow,
  hover,
}: {
  weight?: SketchWeight;
  radius?: string;
  fill?: string;
  line?: string;
  hardShadow?: string;
  hover?: string;
}) {
  const { fill: fillFilter, line: lineFilter } = WEIGHTS[weight];
  return (
    <>
      {hardShadow && (
        <span
          aria-hidden
          className={cn("absolute inset-0", radius, hardShadow, fillFilter)}
        />
      )}
      {fill !== undefined && (
        <span
          aria-hidden
          className={cn(
            "absolute",
            line ? "inset-px" : "inset-0",
            radius,
            fill,
            fillFilter,
            hover,
          )}
        />
      )}
      {line && (
        <span
          aria-hidden
          className={cn("absolute inset-0", radius, line, lineFilter, hover)}
        />
      )}
    </>
  );
}

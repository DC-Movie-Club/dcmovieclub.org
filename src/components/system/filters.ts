// The hand-drawn look's SVG filters, defined once. SketchFilter renders them
// as shared defs for the CSS utilities (sketch, ink, boil; see globals.css),
// and CardSurface renders the same steps along each strip of a card's edge.

export type FilterStep = {
  tag:
    | "feTurbulence"
    | "feDisplacementMap"
    | "feGaussianBlur"
    | "feComposite"
    | "feMorphology";
  attrs: Record<string, string | number>;
  // A later step reads past this one's pixels (the ink line's blur and
  // spread), so CardSurface computes it over a strip grown to cover that
  padded?: boolean;
};

export type SketchFilterDef = {
  id: string;
  region: Region;
  steps: FilterStep[];
};

type Region = { x: string; y: string; width: string; height: string };

// Every filter works in sRGB, not the default linear RGB, which converts
// each pixel in and out on every repaint. The wobble only moves pixels, and
// the ink line blends one color with clear, so linear light buys nothing.
export const FILTER_COLOR_SPACE = { colorInterpolationFilters: "sRGB" } as const;

const SKETCH_REGION: Region = { x: "-5%", y: "-5%", width: "110%", height: "110%" };
// Taller, for the boil's extra shudder and the ink line's spread
const BOIL_REGION: Region = { x: "-5%", y: "-15%", width: "110%", height: "130%" };

// How far the resting wobble moves a shape, in px: the bold line, and the
// fine one for small or quiet things
export const WOBBLE = { bold: 3, fine: 1.4 } as const;

const NOISE = { type: "turbulence", baseFrequency: 0.03, numOctaves: 2 };

// The sketch wobble: noise, and the shape displaced by it
export function wobbleSteps(
  scale: number,
  { seed = 1, result }: { seed?: number; result?: string } = {},
): FilterStep[] {
  return [
    { tag: "feTurbulence", attrs: { ...NOISE, seed, result: "noise" } },
    {
      tag: "feDisplacementMap",
      attrs: {
        in: "SourceGraphic",
        in2: "noise",
        scale,
        xChannelSelector: "R",
        yChannelSelector: "G",
        ...(result && { result }),
      },
    },
  ];
}

// A brush pen line: the sketch wobble, then the stroke's edge is re-cut
// against slow noise so it swells and thins like changing pen pressure. The
// cut is made on a blurred copy, which also smooths away the one-pixel steps
// the displacement leaves. Only for single-color strokes: the color comes
// from dilating the wobbled source, which would blend neighboring colors.
export function inkSteps(scale: number, blur: number): FilterStep[] {
  return [
    ...wobbleSteps(scale, { result: "wobbled" }).map((step) => ({ ...step, padded: true })),
    {
      tag: "feGaussianBlur",
      attrs: { in: "wobbled", stdDeviation: blur, result: "blurred" },
      padded: true,
    },
    {
      tag: "feTurbulence",
      attrs: { type: "fractalNoise", baseFrequency: 0.035, numOctaves: 1, seed: 4, result: "pressure" },
    },
    {
      tag: "feComposite",
      attrs: { in: "blurred", in2: "pressure", operator: "arithmetic", k1: 0, k2: 4, k3: -2.28, k4: -0.336, result: "stroke" },
    },
    {
      tag: "feMorphology",
      attrs: { in: "wobbled", operator: "dilate", radius: 1.5, result: "ink" },
      padded: true,
    },
    { tag: "feComposite", attrs: { in: "ink", in2: "stroke", operator: "in" } },
  ];
}

// The bold ink line's blur, which CardSurface draws its edge with
export const INK_BLUR = 0.8;

// The redraws and boils are animations that step through frames, ten a
// second, each frame a filter of its own with its own noise (see the
// keyframes in globals.css, which name these filters). Stepping between
// static filters repaints an element only when its frame changes; animating
// the noise itself repainted it on every frame of the screen.
//
// The full redraw: the wobble re-rolled
const REDRAW_SEEDS = [1, 20, 42, 65, 88];

// A boil: a small jitter re-rolled on top of the resting wobble, so the
// shape shudders in place rather than being redrawn. How far each level
// shudders a shape, in px; see the boil utilities.
const BOIL_SEEDS = [7, 31, 53, 76, 97];
const BOIL_SCALES = { "boil-sm": 0.7, boil: 1.4, "boil-lg": 3 };

// One filter per seed, `id-0` to `id-4`
function frames(id: string, region: Region, steps: (seed: number) => FilterStep[], seeds: number[]) {
  return seeds.map((seed, i) => ({ id: `${id}-${i}`, region, steps: steps(seed) }));
}

export const sketchFilters: SketchFilterDef[] = [
  { id: "sketch", region: SKETCH_REGION, steps: wobbleSteps(WOBBLE.bold) },
  { id: "sketch-subtle", region: SKETCH_REGION, steps: wobbleSteps(WOBBLE.fine) },
  ...frames("sketch-redraw", SKETCH_REGION, (seed) => wobbleSteps(WOBBLE.bold, { seed }), REDRAW_SEEDS),
  ...frames("sketch-subtle-redraw", SKETCH_REGION, (seed) => wobbleSteps(WOBBLE.fine, { seed }), REDRAW_SEEDS),
  // The wobbles again in the boil's region, for boiling: Safari misplaces
  // the second of two chained filters whose regions differ
  { id: "sketch-boiling", region: BOIL_REGION, steps: wobbleSteps(WOBBLE.bold) },
  { id: "sketch-subtle-boiling", region: BOIL_REGION, steps: wobbleSteps(WOBBLE.fine) },
  { id: "ink", region: BOIL_REGION, steps: inkSteps(WOBBLE.bold, INK_BLUR) },
  { id: "ink-subtle", region: BOIL_REGION, steps: inkSteps(WOBBLE.fine, 0.6) },
  { id: "ink-fine", region: BOIL_REGION, steps: inkSteps(WOBBLE.bold, 0.45) },
  ...Object.entries(BOIL_SCALES).flatMap(([id, scale]) =>
    frames(id, BOIL_REGION, (seed) => wobbleSteps(scale, { seed }), BOIL_SEEDS),
  ),
];

export type Rgb = { r: number; g: number; b: number };
export type Hsv = { h: number; s: number; v: number };
export type Oklch = { l: number; c: number; h: number };

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// Accepts #rgb, #rgba, #rrggbb and #rrggbbaa; alpha is dropped, so a
// translucent color is treated as opaque
export function hexToRgb(hex: string): Rgb | null {
  if (!HEX.test(hex)) return null;
  const digits = hex.slice(1);
  const full =
    digits.length <= 4
      ? digits.replace(/./g, (d) => d + d)
      : digits;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.round(Math.min(255, Math.max(0, x)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

// The #rrggbb form of any hex color, or null if it isn't one
export function normalizeHex(hex: string): string | null {
  const rgb = hexToRgb(hex);
  return rgb && rgbToHex(rgb);
}

// HSV conversions adapted from the Lexical playground's ColorPicker (v0.43.0)
export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);

  const h = d
    ? (max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? 2 + (b - r) / d
          : 4 + (r - g) / d) * 60
    : 0;
  const s = max ? (d / max) * 100 : 0;
  const v = max * 100;

  return { h, s, v };
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  s /= 100;
  v /= 100;

  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  const index = i % 6;

  return {
    r: Math.round([v, q, p, p, t, v][index] * 255),
    g: Math.round([t, v, v, q, p, p][index] * 255),
    b: Math.round([p, p, t, v, v, q][index] * 255),
  };
}

function toLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromLinear(c: number) {
  const encoded = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
  return encoded * 255;
}

// WCAG 2 relative luminance
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`Not a hex color: ${hex}`);
  return (
    0.2126 * toLinear(rgb.r) +
    0.7152 * toLinear(rgb.g) +
    0.0722 * toLinear(rgb.b)
  );
}

// WCAG 2 contrast ratio, from 1 (identical) to 21 (black on white)
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// `color` at `opacity` laid over `ground`, the color the browser paints for
// translucent text
export function blend(color: string, ground: string, opacity: number): string {
  const top = hexToRgb(color)
  const bottom = hexToRgb(ground)
  if (!top || !bottom) throw new Error(`Not a hex color: ${top ? ground : color}`)
  const mix = (a: number, b: number) => a * opacity + b * (1 - opacity)
  return rgbToHex({
    r: mix(top.r, bottom.r),
    g: mix(top.g, bottom.g),
    b: mix(top.b, bottom.b),
  })
}

// OKLab matrices from Björn Ottosson, https://bottosson.github.io/posts/oklab/
function linearToOklch(r: number, g: number, b: number): Oklch {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const hue = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: hue < 0 ? hue + 360 : hue };
}

function oklchToLinear({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);

  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex: string): Oklch {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`Not a hex color: ${hex}`);
  return linearToOklch(toLinear(rgb.r), toLinear(rgb.g), toLinear(rgb.b));
}

function inGamut(channels: number[]) {
  return channels.every((c) => c >= -0.0001 && c <= 1.0001);
}

// Colors outside sRGB keep their lightness and hue and lose chroma until they
// fit, the way a browser shows an out-of-gamut oklch()
export function oklchToHex(color: Oklch): string {
  const l = Math.min(1, Math.max(0, color.l));
  let channels = oklchToLinear({ ...color, l });
  if (!inGamut(channels)) {
    let low = 0;
    let high = color.c;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) low = mid;
      else high = mid;
    }
    channels = oklchToLinear({ l, c: low, h: color.h });
  }
  const [r, g, b] = channels.map((c) => fromLinear(Math.min(1, Math.max(0, c))));
  return rgbToHex({ r, g, b });
}

// Lighter and darker versions of a color, made by stepping its OKLCH lightness
// evenly toward black and toward white with the hue kept. Chroma eases off in
// proportion, the way the hand-made -dark and -light brand shades fade toward
// neutral (rust-dark has about 0.6x rust's lightness and chroma). Steps that
// come out the same as the color or an earlier step are dropped, so
// near-black and near-white colors get fewer.
export function shades(
  hex: string,
  steps = 4,
): { darker: string[]; lighter: string[] } {
  const base = hexToOklch(hex);
  const seen = new Set([normalizeHex(hex)]);
  const unique = (shade: string) => {
    if (seen.has(shade)) return false;
    seen.add(shade);
    return true;
  };
  const fractions = Array.from(
    { length: steps },
    (_, i) => (i + 1) / (steps + 1),
  );
  const step = (l: number, f: number) =>
    oklchToHex({ l, c: base.c * (1 - f), h: base.h });

  return {
    darker: fractions
      .map((f) => step(base.l * (1 - f), f))
      .filter(unique)
      .reverse(),
    lighter: fractions
      .map((f) => step(base.l + (1 - base.l) * f, f))
      .filter(unique),
  };
}

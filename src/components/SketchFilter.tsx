export const SKETCH_NOISE = { baseFrequency: 0.03, numOctaves: 2, seed: 1 };
export const SKETCH_SCALE = 3;

const SKETCH_REGION = 'x="-5%" y="-5%" width="110%" height="110%"';
const BOIL_REGION = 'x="-5%" y="-15%" width="110%" height="130%"';

function sketchFilter(
  id: string,
  scale: number,
  animated: boolean,
  region = SKETCH_REGION,
) {
  const animate = animated
    ? `<animate attributeName="seed" values="1;20;42;65;88" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />`
    : "";
  return `<filter id="${id}" ${region} filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="${SKETCH_NOISE.baseFrequency}" numOctaves="${SKETCH_NOISE.numOctaves}" seed="${SKETCH_NOISE.seed}" result="noise">${animate}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
  </filter>`;
}

// The brush pen line's settings, shared with CardSurface, which draws the
// `ink` line in strips. `blur` is that line's; the subtler lines blur less.
export const INK = {
  blur: 0.8,
  pressure: { baseFrequency: 0.035, numOctaves: 1, seed: 4 },
  cut: { k1: 0, k2: 4, k3: -2.28, k4: -0.336 },
  spread: 1.5,
};

// A brush pen line: the sketch wobble, then the stroke's edge is re-cut
// against slow noise so it swells and thins like changing pen pressure. The
// cut is made on a blurred copy, which also smooths away the one-pixel steps
// the displacement leaves. Only for single-color strokes: the color comes
// from dilating the wobbled source, which would blend neighboring colors.
function inkFilter(id: string, scale: number, blur: number) {
  const { pressure, cut } = INK;
  return `<filter id="${id}" x="-5%" y="-15%" width="110%" height="130%" filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="${SKETCH_NOISE.baseFrequency}" numOctaves="${SKETCH_NOISE.numOctaves}" seed="${SKETCH_NOISE.seed}" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="wobbled" />
    <feGaussianBlur in="wobbled" stdDeviation="${blur}" result="blurred" />
    <feTurbulence type="fractalNoise" baseFrequency="${pressure.baseFrequency}" numOctaves="${pressure.numOctaves}" seed="${pressure.seed}" result="pressure" />
    <feComposite in="blurred" in2="pressure" operator="arithmetic" k1="${cut.k1}" k2="${cut.k2}" k3="${cut.k3}" k4="${cut.k4}" result="stroke" />
    <feMorphology in="wobbled" operator="dilate" radius="${INK.spread}" result="ink" />
    <feComposite in="ink" in2="stroke" operator="in" />
  </filter>`;
}

// How far each boil level shudders a shape, in px. A boil is a small jitter
// re-rolled ten times a second on top of the resting wobble, so the shape
// shudders in place rather than being redrawn. See the boil utilities.
const BOIL_SCALES = { "boil-sm": 0.7, boil: 1.4, "boil-lg": 3 };

function boilFilter(id: string, scale: number) {
  return `<filter id="${id}" ${BOIL_REGION} filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="${SKETCH_NOISE.baseFrequency}" numOctaves="${SKETCH_NOISE.numOctaves}" seed="7" result="noise">
      <animate attributeName="seed" values="7;31;53;76;97" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
  </filter>`;
}

export function SketchFilter() {
  const svg = `<svg aria-hidden="true" class="pointer-events-none absolute" style="width:0;height:0">
    <defs>
      ${sketchFilter("sketch", SKETCH_SCALE, false)}
      ${sketchFilter("sketch-animated", SKETCH_SCALE, true)}
      ${sketchFilter("sketch-subtle", 1.4, false)}
      ${sketchFilter("sketch-subtle-animated", 1.4, true)}
      ${sketchFilter("sketch-boiling", SKETCH_SCALE, false, BOIL_REGION)}
      ${sketchFilter("sketch-subtle-boiling", 1.4, false, BOIL_REGION)}
      ${inkFilter("ink", SKETCH_SCALE, INK.blur)}
      ${inkFilter("ink-subtle", 1.4, 0.6)}
      ${inkFilter("ink-fine", SKETCH_SCALE, 0.45)}
      ${Object.entries(BOIL_SCALES)
        .map(([id, scale]) => boilFilter(id, scale))
        .join("")}
    </defs>
  </svg>`;

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

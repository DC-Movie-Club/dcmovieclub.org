export const SKETCH_NOISE = { baseFrequency: 0.03, numOctaves: 2, seed: 1 };
export const SKETCH_SCALE = 3;

function sketchFilter(id: string, scale: number, animated: boolean) {
  const animate = animated
    ? `<animate attributeName="seed" values="1;20;42;65;88" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />`
    : "";
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="${SKETCH_NOISE.baseFrequency}" numOctaves="${SKETCH_NOISE.numOctaves}" seed="${SKETCH_NOISE.seed}" result="noise">${animate}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
  </filter>`;
}

// A brush pen line: the sketch wobble, then the stroke's edge is re-cut
// against slow noise so it swells and thins like changing pen pressure. The
// cut is made on a blurred copy, which also smooths away the one-pixel steps
// the displacement leaves. Only for single-color strokes: the color comes
// from dilating the wobbled source, which would blend neighboring colors.
function inkFilter(id: string, scale: number, blur: number, animated: boolean) {
  const animate = animated
    ? `<animate attributeName="seed" values="1;20;42;65;88" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />`
    : "";
  return `<filter id="${id}" x="-5%" y="-15%" width="110%" height="130%" filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="${SKETCH_NOISE.baseFrequency}" numOctaves="${SKETCH_NOISE.numOctaves}" seed="${SKETCH_NOISE.seed}" result="noise">${animate}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="wobbled" />
    <feGaussianBlur in="wobbled" stdDeviation="${blur}" result="blurred" />
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="4" result="pressure" />
    <feComposite in="blurred" in2="pressure" operator="arithmetic" k1="0" k2="4" k3="-2.28" k4="-0.336" result="stroke" />
    <feMorphology in="wobbled" operator="dilate" radius="1.5" result="ink" />
    <feComposite in="ink" in2="stroke" operator="in" />
  </filter>`;
}

export function SketchFilter() {
  const svg = `<svg aria-hidden="true" class="pointer-events-none absolute" style="width:0;height:0">
    <defs>
      ${sketchFilter("sketch", SKETCH_SCALE, false)}
      ${sketchFilter("sketch-animated", SKETCH_SCALE, true)}
      ${sketchFilter("sketch-subtle", 1.4, false)}
      ${sketchFilter("sketch-subtle-animated", 1.4, true)}
      ${inkFilter("ink", SKETCH_SCALE, 0.8, false)}
      ${inkFilter("ink-animated", SKETCH_SCALE, 0.8, true)}
      ${inkFilter("ink-subtle", 1.4, 0.6, false)}
      ${inkFilter("ink-subtle-animated", 1.4, 0.6, true)}
      ${inkFilter("ink-fine", SKETCH_SCALE, 0.45, false)}
      ${inkFilter("ink-fine-animated", SKETCH_SCALE, 0.45, true)}
    </defs>
  </svg>`;

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

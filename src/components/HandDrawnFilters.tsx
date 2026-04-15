const SCALE = 2;
const NUM_OCTAVES = 5;
const BLUR = 0.4;
const SHARPEN_KERNEL = "0 -1 0  -1 5 -1  0 -1 0";

const frames = [0.042, 0.048, 0.054, 0.046, 0.051] as const;

function PencilFilter({
  id,
  baseFrequency,
}: {
  id: string;
  baseFrequency: number;
}) {
  return (
    <filter id={id}>
      <feTurbulence
        type="fractalNoise"
        baseFrequency={baseFrequency}
        numOctaves={NUM_OCTAVES}
        result="noise"
      />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={SCALE} result="displaced" />
      <feGaussianBlur in="displaced" stdDeviation={BLUR} result="softened" />
      <feConvolveMatrix in="softened" order={3} kernelMatrix={SHARPEN_KERNEL} />
    </filter>
  );
}

export function HandDrawnFilters() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <defs>
        <PencilFilter id="hand-drawn" baseFrequency={0.05} />
        {frames.map((freq, i) => (
          <PencilFilter key={i} id={`hand-drawn-f${i + 1}`} baseFrequency={freq} />
        ))}
      </defs>
    </svg>
  );
}

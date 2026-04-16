const seeds = [
  { lg: 88, md: 55 },
  { lg: 23, md: 71 },
  { lg: 44, md: 99 },
  { lg: 61, md: 33 },
];

function watercolorFilter(id: string, seedLg: number, seedMd: number) {
  return `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">
    <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="5" seed="${seedLg}" result="noise-lg" />
    <feTurbulence type="turbulence" baseFrequency="0.12" numOctaves="3" seed="${seedMd}" result="noise-md" />
    <feDisplacementMap in="SourceGraphic" in2="noise-lg" scale="15" xChannelSelector="R" yChannelSelector="G" result="d1" />
    <feDisplacementMap in="d1" in2="noise-md" scale="6" xChannelSelector="B" yChannelSelector="R" result="d2" />
    <feGaussianBlur in="d2" stdDeviation="1" result="blurred" />
    <feComponentTransfer in="blurred">
      <feFuncA type="discrete" tableValues="0 0.3 0.6 0.8 1" />
    </feComponentTransfer>
  </filter>`;
}

export const WATERCOLOR_COUNT = seeds.length;

export function WatercolorFilter() {
  const svg = `<svg aria-hidden="true" class="pointer-events-none absolute" style="width:0;height:0">
    <defs>
      ${seeds.map((s, i) => watercolorFilter(`watercolor-${i}`, s.lg, s.md)).join("\n")}
    </defs>
  </svg>`;

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

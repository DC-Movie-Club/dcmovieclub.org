function sketchFilter(id: string, scale: number, animated: boolean) {
  const animate = animated
    ? `<animate attributeName="seed" values="1;20;42;65;88" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />`
    : "";
  return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
    <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" seed="1" result="noise">${animate}</feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
  </filter>`;
}

export function SketchFilter() {
  const svg = `<svg aria-hidden="true" class="pointer-events-none absolute" style="width:0;height:0">
    <defs>
      ${sketchFilter("sketch", 3, false)}
      ${sketchFilter("sketch-animated", 3, true)}
      ${sketchFilter("sketch-subtle", 1.4, false)}
      ${sketchFilter("sketch-subtle-animated", 1.4, true)}
    </defs>
  </svg>`;

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

function HandDrawnFilter({
  id,
  seed,
  wobbleScale = 5,
  wobbleOctaves = 5,
}: {
  id: string;
  seed?: number;
  wobbleScale?: number;
  wobbleOctaves?: number;
}) {
  return (
    <filter
      id={id}
      x="-5%"
      y="-5%"
      width="110%"
      height="110%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.03"
        numOctaves={wobbleOctaves}
        seed={seed}
        result="wobbleNoise"
      />
      <feDisplacementMap
        xChannelSelector="R"
        yChannelSelector="G"
        in="SourceGraphic"
        in2="wobbleNoise"
        scale={wobbleScale}
        result="wobbled"
      />
      <feGaussianBlur in="wobbled" stdDeviation={0.4} result="smooth" />
      <feConvolveMatrix
        in="smooth"
        order={3}
        kernelMatrix="0 -1 0  -1 5 -1  0 -1 0"
        result="smoothSharp"
      />
      <feTurbulence
        type="fractalNoise"
        baseFrequency="3.0"
        numOctaves={3}
        seed={77 + (seed ?? 0)}
        result="texNoise"
      />
      <feDisplacementMap
        xChannelSelector="R"
        yChannelSelector="G"
        in="wobbled"
        in2="texNoise"
        scale={2}
        result="textured"
      />
      <feGaussianBlur in="textured" stdDeviation={0.25} result="texturedSoft" />
      <feComposite
        operator="arithmetic"
        k1={0}
        k2={0.6}
        k3={0.4}
        k4={0}
        in="smoothSharp"
        in2="texturedSoft"
      />
    </filter>
  );
}

const animationSeeds = [1, 20, 42, 65, 88] as const;

export function HandDrawnFilters() {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0">
      <defs>
        <HandDrawnFilter id="hand-drawn" />
        {animationSeeds.map((seed, i) => (
          <HandDrawnFilter key={seed} id={`hand-drawn-f${i + 1}`} seed={seed} />
        ))}
        <HandDrawnFilter id="hand-drawn-subtle" wobbleScale={3} wobbleOctaves={3} />
        {animationSeeds.map((seed, i) => (
          <HandDrawnFilter key={seed} id={`hand-drawn-subtle-f${i + 1}`} seed={seed} wobbleScale={3} wobbleOctaves={3} />
        ))}
      </defs>
    </svg>
  );
}

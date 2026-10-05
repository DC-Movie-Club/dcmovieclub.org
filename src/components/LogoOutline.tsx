import { cn } from "@/lib/utils";
import { logoLines } from "@/components/logoLetters";
import { logoStars, logoStripes } from "@/components/logoStripes";

// The logo's art framed the way dcmc-logo.png frames it, so the two can swap
// in place
const VIEW_BOX = "26 44 757 757";

// The logo drawn in charcoal line on cream: its stripes outlined, its stars and
// letters solid. The ink filter only suits one color, so the cream fill is its
// own layer underneath, under the matching sketch wobble so the two line up.
// `className` places the pair; it should give them a positioned box.
export function LogoOutline({ className }: { className?: string }) {
  return (
    <span aria-hidden className={className}>
      <svg
        viewBox={VIEW_BOX}
        className="absolute inset-0 size-full overflow-visible sketch-subtle"
      >
        {Object.values(logoStripes).map((stripe) => (
          <path key={stripe.key} d={stripe.outline} className="fill-surface" />
        ))}
      </svg>
      <svg
        viewBox={VIEW_BOX}
        className="absolute inset-0 size-full overflow-visible ink-subtle"
      >
        {Object.values(logoStripes).map((stripe) => (
          <path
            key={stripe.key}
            d={stripe.outline}
            fill="none"
            strokeWidth={2.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-charcoal"
          />
        ))}
        {logoStars.map((d) => (
          <path key={d} d={d} className="fill-charcoal" />
        ))}
        {Object.values(logoLines).flatMap((line) =>
          Object.values(line.letters).flatMap((letter) =>
            letter.glyph.map((d: string) => (
              <path key={d} d={d} className="fill-charcoal" />
            )),
          ),
        )}
      </svg>
    </span>
  );
}

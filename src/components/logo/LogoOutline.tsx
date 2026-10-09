import { cn } from "@/lib/utils";
import { logoLines } from "@/components/logo/logoLetters";
import { logoStars, logoStripes } from "@/components/logo/logoStripes";

// The logo's art framed the way dcmc-logo.png frames it, so the two can swap
// in place
const VIEW_BOX = "26 44 757 757";

// The logo drawn in line on cream: its stripes outlined, its stars and letters
// solid, in the text color (charcoal unless `className` sets one). The ink
// filter only suits one color, so the cream fill is its own layer underneath,
// under the matching sketch wobble so the two line up. `className` places the
// pair and should give them a positioned box; `layerClassName` goes on both
// layers, for effects like a boil that have to move them together.
export function LogoOutline({
  className,
  layerClassName,
}: {
  className?: string;
  layerClassName?: string;
}) {
  return (
    <span aria-hidden className={cn("text-charcoal", className)}>
      <svg
        viewBox={VIEW_BOX}
        className={cn(
          "absolute inset-0 size-full overflow-visible sketch-subtle",
          layerClassName,
        )}
      >
        {Object.values(logoStripes).map((stripe) => (
          <path key={stripe.key} d={stripe.outline} className="fill-surface" />
        ))}
      </svg>
      <svg
        viewBox={VIEW_BOX}
        className={cn(
          "absolute inset-0 size-full overflow-visible ink-subtle",
          layerClassName,
        )}
      >
        {Object.values(logoStripes).map((stripe) => (
          <path
            key={stripe.key}
            d={stripe.outline}
            fill="none"
            strokeWidth={2.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-current"
          />
        ))}
        {logoStars.map((d) => (
          <path key={d} d={d} className="fill-current" />
        ))}
        {Object.values(logoLines).flatMap((line) =>
          Object.values(line.letters).flatMap((letter) =>
            letter.glyph.map((d: string) => (
              <path key={d} d={d} className="fill-current" />
            )),
          ),
        )}
      </svg>
    </span>
  );
}

import { logoLines } from "@/components/logo/logoLetters";
import { cn } from "@/lib/utils";

// In the logo's own units. Row puts CLUB after DC MOVIE on one line, closing
// its letters up to DC MOVIE's spacing (the logo spreads them to fill a line
// of their own); stacked centers it underneath, as in the logo.
const layouts = {
  row: {
    key: "row",
    viewBox: "70.8 386.2 1164.8 160.7",
    club: "translate(619.1 -185.3)",
    clubShifts: { l: -17.5, u: -32.1, b: -55.7 },
  },
  stacked: { key: "stacked", viewBox: "70.8 386.2 687.6 315.7", club: "translate(-2.7 -25.9)", clubShifts: {} },
} as const;

export function LogoLettering({
  layout,
  className,
}: {
  layout: keyof typeof layouts;
  className?: string;
}) {
  const { viewBox, club } = layouts[layout];
  const clubShifts: Partial<Record<string, number>> = layouts[layout].clubShifts;
  return (
    <svg aria-hidden viewBox={viewBox} className={cn("block h-auto w-full overflow-visible", className)}>
      {Object.values(logoLines).map((line) => (
        <g key={line.key} transform={line.key === "club" ? club : undefined}>
          {Object.values(line.letters).map((letter) => (
            <g
              key={letter.key}
              transform={line.key === "club" ? `translate(${clubShifts[letter.key] ?? 0} 0)` : undefined}
            >
              <path d={letter.square} transform="translate(7 7)" className="fill-rust-dark" />
              <path d={letter.square} className="fill-logo-red" />
              {letter.glyph.map((d: string) => (
                <path key={d} d={d} className="fill-cream" />
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

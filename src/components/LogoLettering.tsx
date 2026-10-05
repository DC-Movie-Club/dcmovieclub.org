import { logoLines } from "@/components/logoLetters";
import { cn } from "@/lib/utils";

// In the logo's own units. Row puts CLUB after DC MOVIE on one line; stacked
// centers it underneath, as in the logo.
const layouts = {
  row: { key: "row", viewBox: "70.8 386.2 1220.5 160.7", club: "translate(619.1 -185.3)" },
  stacked: { key: "stacked", viewBox: "70.8 386.2 687.6 315.7", club: "translate(-2.7 -25.9)" },
} as const;

export function LogoLettering({
  layout,
  className,
}: {
  layout: keyof typeof layouts;
  className?: string;
}) {
  const { viewBox, club } = layouts[layout];
  return (
    <svg aria-hidden viewBox={viewBox} className={cn("block h-auto w-full overflow-visible", className)}>
      {Object.values(logoLines).map((line) => (
        <g key={line.key} transform={line.key === "club" ? club : undefined}>
          {Object.values(line.letters).map((letter) => (
            <g key={letter.key}>
              <path d={letter.square} transform="translate(7 7)" className="fill-rust-dark" />
              <path d={letter.square} className="fill-logo-red" />
              {letter.glyph.map((d) => (
                <path key={d} d={d} className="fill-cream" />
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/CardSurface";

// A fixed angle lifts the far end of a long heading well above the card, so the
// tilt shrinks with length to keep that rise roughly constant (capped at 3deg).
function headingTilt(heading: string) {
  return -Math.min(3, 30 / Math.max(heading.length, 1));
}

// A cream card with `label` as an outlined label on its top edge, inked in the
// page's ink color
export function SectionCard({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative flex scroll-mt-8 flex-col items-start">
      <CardSurface />
      {/* A small negative margin lets the label's top poke over the card's
          edge while it stays in flow, so long headings can wrap. */}
      {label && (
        <h2
          className="relative -mt-2.5 ml-4 mr-4 origin-bottom-left text-3xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink sm:-mt-3 sm:ml-6 sm:text-4xl"
          style={{ rotate: `${headingTilt(label)}deg` }}
        >
          {label}
        </h2>
      )}
      <div
        className={cn(
          "relative self-stretch px-6 pb-8 sm:px-8",
          label ? "pt-4" : "pt-8",
        )}
      >
        {children}
      </div>
    </section>
  );
}

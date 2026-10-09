import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/CardSurface";
import { textStyles } from "@/components/textStyles";
import { SmartLink } from "@/components/system/SmartLink";

// A fixed angle lifts the far end of a long heading well above the card, so the
// tilt shrinks with length to keep that rise roughly constant (capped at 2deg).
function headingTilt(heading: string) {
  return -Math.min(2, 20 / Math.max(heading.length, 1));
}

// An outlined label on a card's top edge, inked in the page's ink color. It
// goes first in the card's flow, in a column with items-start: a small
// negative margin lets its top poke over the edge while it stays in flow, so
// long labels can wrap.
export function CardLabel({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h2" | "p";
  className?: string;
  children: string;
}) {
  return (
    <Tag
      className={cn(
        "relative -mt-2 ml-4 mr-4 origin-bottom-left sm:-mt-3 sm:ml-6",
        textStyles.labelLettering,
        className,
      )}
      style={{ rotate: `${headingTilt(children)}deg` }}
    >
      {children}
    </Tag>
  );
}

// An accent pill straddling a card's top-right corner, as the class for the
// element and its face to put inside. Inside a clickable card (group/card) it
// also reacts while the card is hovered.
export const cardEdgeClassName =
  "group/edge absolute top-0 right-4 z-10 block -translate-y-1/2 rounded-full transition-transform hover:scale-105 card-hover:scale-105 focus-ring sm:right-6";

export function CardEdgeFace({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-px rounded-full bg-page-accent shadow-lg sketch group-hover/edge:boil card-hover:boil"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge ink group-hover/edge:boil card-hover:boil"
      />
      <span
        className={cn(
          "relative flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3",
          textStyles.accentPill,
        )}
      >
        {children}
      </span>
    </>
  );
}

export function CardEdgeLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <SmartLink href={href} className={cardEdgeClassName}>
      <CardEdgeFace>{children}</CardEdgeFace>
    </SmartLink>
  );
}

// A cream card with `label` on its top edge
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
      {label && <CardLabel>{label}</CardLabel>}
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

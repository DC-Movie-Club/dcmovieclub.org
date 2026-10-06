import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/CardSurface";

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
        "relative -mt-2 ml-4 mr-4 origin-bottom-left text-4xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink sm:-mt-3 sm:ml-6 sm:text-5xl",
        className,
      )}
      style={{ rotate: `${headingTilt(children)}deg` }}
    >
      {children}
    </Tag>
  );
}

// An accent pill straddling a card's top-right corner. Inside a clickable
// card (group/card) it also reacts while the card is hovered.
export function CardEdgeLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = !href.startsWith("/");
  return (
    <NextLink
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group/edge absolute top-0 right-4 z-10 block -translate-y-1/2 rounded-full transition-transform hover:scale-105 card-hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-6"
    >
      <span
        aria-hidden
        className="absolute inset-px rounded-full bg-page-accent shadow-lg sketch group-hover/edge:boil card-hover:boil"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge ink group-hover/edge:boil card-hover:boil"
      />
      <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-page-accent-text sm:px-6 sm:py-3 sm:text-base">
        {children}
      </span>
    </NextLink>
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

import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/system/CardSurface";
import { textStyles } from "@/components/system/textStyles";

// A fixed angle lifts the far end of a long heading well above the card, so the
// tilt shrinks with length to keep that rise roughly constant (capped at 2deg).
function headingTilt(heading: string) {
  return -Math.min(2, 20 / Math.max(heading.length, 1));
}

// An outlined label on a card's top edge, inked in the page's ink color. It
// goes first in the card's flow, in a column with items-start: a small
// negative margin lets its top poke over the edge while it stays in flow, so
// long labels can wrap.
function CardLabel({
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

type LinkProps = {
  className?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
};

// The hand-drawn cream card, bordered in the page's edge color.
// - `label` sits on its top edge, outlined in the page's ink.
// - `action` is a CardAction on its top-right corner.
// - `link` makes the whole card clickable: an element (like EventCtaLink)
//   stretched under the content, which lets clicks through to it (give
//   anything inside that should take its own clicks pointer-events-auto).
//   While the card is hovered its edge and label turn the page's accent edge.
// - The content gets the card's padding, unless `padded` is false for content
//   that lays itself out against the edges.
export function Card({
  as: Tag = "div",
  id,
  label,
  labelAs,
  action,
  link,
  padded = true,
  className,
  children,
}: {
  as?: "div" | "section" | "article";
  id?: string;
  label?: string;
  labelAs?: "h2" | "p";
  action?: React.ReactNode;
  link?: ReactElement<LinkProps>;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const Link = link?.type as React.ElementType | undefined;
  return (
    <Tag
      id={id}
      className={cn(
        "relative flex scroll-mt-8 flex-col items-start",
        link && "group/card",
        className,
      )}
    >
      <CardSurface className={cn(link && "card-hover:stroke-page-accent-edge")} />
      {Link && link && (
        <Link
          {...link.props}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 rounded-2xl"
        />
      )}
      {label && (
        <CardLabel
          as={labelAs}
          className={cn(link && "pointer-events-none card-hover:outline-ink-page-accent-edge")}
        >
          {label}
        </CardLabel>
      )}
      {padded ? (
        <div
          className={cn(
            "relative self-stretch px-6 pb-8 sm:px-8",
            label ? "pt-4" : "pt-8",
            link && "pointer-events-none",
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
      {action}
    </Tag>
  );
}

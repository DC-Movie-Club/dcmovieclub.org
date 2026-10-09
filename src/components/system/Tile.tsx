import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { LinkOverlay } from "@/components/system/LinkOverlay";
import { SketchShape } from "@/components/system/SketchShape";
import { SmartLink } from "@/components/system/SmartLink";

type FaceProps = { className?: string; children?: React.ReactNode };

// A small cream card in a grid, edged in the page's edge color. Linked (by
// `href`, or `render` for an element like EventCtaLink), it tilts on hover.
// `opens` marks one that opens another site: on hover its edge turns the
// page's accent edge and a wash with an arrow covers it. Content can react to
// the hover with group-hover/tile; `badge` sits over everything, the wash
// included.
export function Tile({
  href,
  render,
  opens,
  badge,
  className,
  children,
}: {
  href?: string;
  render?: ReactElement<FaceProps>;
  opens?: boolean;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const linked = Boolean(href || render);
  const rootClassName = cn(
    "group/tile relative block h-full rounded-xl transition-transform focus-ring",
    linked && "hover:-rotate-1 hover:scale-102",
    className,
  );
  const face = (
    <>
      <SketchShape
        radius="rounded-xl"
        fill="bg-cream"
        line={cn(
          "border-[2.5px] border-page-edge",
          opens && "transition-colors parent-hover:border-page-accent-edge",
        )}
      />
      {children}
      {opens && (
        <LinkOverlay
          className="group-hover/tile:opacity-100"
          washClassName="inset-px rounded-xl sketch"
        />
      )}
      {badge}
    </>
  );

  if (render) {
    const Render = render.type as React.ElementType;
    return (
      <Render {...render.props} className={cn(rootClassName, render.props.className)}>
        {face}
      </Render>
    );
  }
  if (href) {
    return (
      <SmartLink href={href} className={rootClassName}>
        {face}
      </SmartLink>
    );
  }
  return <div className={rootClassName}>{face}</div>;
}

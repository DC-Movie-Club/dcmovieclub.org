import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Where an icon's redraw comes from: hovering its parent (the link it's the
// face of) or the tile it sits on
const REDRAWS = {
  parent: "parent-hover:sketch-subtle-animated",
  tile: "group-hover/tile:sketch-subtle-animated",
} as const;

// An icon in the pencil line, fine unless it's large, redrawn on hover when
// it stands for a link
export function SketchIcon({
  icon: Icon,
  size,
  bold,
  redraw,
  strokeWidth,
  className,
}: {
  icon: LucideIcon;
  size: number;
  bold?: boolean;
  redraw?: keyof typeof REDRAWS;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={cn(bold ? "sketch" : "sketch-subtle", redraw && REDRAWS[redraw], className)}
    />
  );
}

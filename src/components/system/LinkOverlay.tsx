import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { textStyles } from "@/components/system/textStyles";

// Shown over a linked tile or poster while it's hovered: a wash in the page's
// accent edge with an arrow, and `caption` under it. `className` reveals it
// (with the tile's group hover); `washClassName` shapes the wash to the tile.
export function LinkOverlay({
  caption,
  className,
  washClassName,
}: {
  caption?: string;
  className: string;
  washClassName?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center opacity-0 transition-opacity",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-page-accent-edge/80", washClassName)} />
      <ArrowUpRight size={32} strokeWidth={2.5} className="relative text-cream sketch" />
      {caption && (
        <span className={cn("relative", textStyles.overlayCaption)}>
          {caption}
        </span>
      )}
    </div>
  );
}

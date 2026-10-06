import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function OpensOverlay({
  className,
  washClassName,
}: {
  className: string;
  washClassName: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-page-accent-edge/80", washClassName)} />
      <ArrowUpRight
        size={32}
        strokeWidth={2.5}
        className="relative text-cream sketch"
      />
    </div>
  );
}

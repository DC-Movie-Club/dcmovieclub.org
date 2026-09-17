import { cn } from "@/lib/utils";

// The hand-drawn cream card surface, bordered in the page's edge color. Render
// it first inside a `relative` container; content after it needs `relative`
// to sit on top. `className` adds variants like hover border colors.
export function CardSurface({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 rounded-2xl border-[3px] border-page-edge bg-cream shadow-xl transition-colors sketch",
        className,
      )}
    />
  );
}

export function CreamCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CardSurface />
      <div className="relative px-6 py-8 sm:px-8">{children}</div>
    </div>
  );
}

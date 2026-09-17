import { cn } from "@/lib/utils";

// A full-bleed colored page. `className` sets the background and page colors,
// e.g. "bg-teal page-ink-teal-dark page-edge-teal-light"; `contentClassName`
// sets the spacing between sections.
export function ColorPage({
  className,
  contentClassName,
  children,
}: {
  className: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the color runs to the bottom edge; pb-36 re-adds that clearance.
    <div
      className={cn("-mb-24 min-h-screen px-6 pt-14 pb-36 sm:pt-20", className)}
    >
      <div
        className={cn(
          "mx-auto flex max-w-3xl flex-col gap-14",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Outlined cream lettering in the page's ink color
export function PageTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h1
      className={cn(
        "text-5xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink sm:text-6xl",
        className,
      )}
    >
      {children}
    </h1>
  );
}

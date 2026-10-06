import { TicketsDialog } from "@/components/events/TicketsDialog";
import type { EventCta } from "@/components/events/event-links";

// Follows an event's CTA: a link, or with several tickets, a dialog to pick one
export function EventCtaLink({
  cta,
  title,
  className,
  tabIndex,
  "aria-hidden": ariaHidden,
  children,
}: {
  cta: EventCta;
  title: string;
  className?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
  children?: React.ReactNode;
}) {
  if ("tickets" in cta) {
    return (
      <TicketsDialog
        title={title}
        tickets={cta.tickets}
        className={className}
        tabIndex={tabIndex}
        aria-hidden={ariaHidden}
      >
        {children}
      </TicketsDialog>
    );
  }

  return (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      className={className}
    >
      {children}
    </a>
  );
}

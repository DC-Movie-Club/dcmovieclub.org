import { ArrowUpRight, Ticket, type LucideIcon } from "lucide-react";
import type { CalendarEvent, EventTicket } from "@/types/event";

export function getMapUrl(location: string | null) {
  return location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : null;
}

// An event with several ticket links (e.g. a choice of films) gets a picker
// instead of a single href.
export type EventCta = { label: string; icon: LucideIcon } & (
  { href: string } | { tickets: EventTicket[] }
);

export function getEventCta(event: CalendarEvent): EventCta | null {
  if (event.tickets.length > 1) {
    return { tickets: event.tickets, label: "Get Tickets", icon: Ticket };
  }
  if (event.tickets.length === 1) {
    return { href: event.tickets[0].url, label: "Get Tickets", icon: Ticket };
  }
  if (event.link) {
    return { href: event.link, label: "View on Calendar", icon: ArrowUpRight };
  }
  return null;
}

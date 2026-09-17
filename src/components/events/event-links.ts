import { ArrowUpRight, Ticket, type LucideIcon } from "lucide-react";
import type { CalendarEvent } from "@/types/event";

export function getMapUrl(location: string | null) {
  return location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : null;
}

export function getEventCta(
  event: CalendarEvent,
): { href: string; label: string; icon: LucideIcon } | null {
  if (event.ticketUrl) {
    return { href: event.ticketUrl, label: "Get Tickets", icon: Ticket };
  }
  if (event.link) {
    return { href: event.link, label: "View on Calendar", icon: ArrowUpRight };
  }
  return null;
}

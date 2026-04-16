import { MapPin, Clock, CalendarDays, Ticket, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUpcomingEvents } from "@/lib/data";
import type { CalendarEvent } from "@/types/event";

function formatDate(iso: string) {
  const date = new Date(iso);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }),
    day: date.getDate(),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function EventCard({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatDate(event.start);

  return (
    <div className="group/event flex gap-5 rounded-xl border-2 border-charcoal/15 p-5 transition-colors hover:border-charcoal/30">
      <div className="flex shrink-0 flex-col items-center rounded-lg bg-rust/10 px-3 py-2 text-center">
        <span className="text-xs font-medium uppercase tracking-widest text-rust">
          {month}
        </span>
        <span className="text-3xl leading-tight text-rust">{day}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-xl uppercase tracking-wide">{event.title}</h3>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays size={14} className="shrink-0" />
          {weekday}
        </p>

        {!event.allDay && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} className="shrink-0" />
            {formatTimeRange(event.start, event.end)}
          </p>
        )}

        {event.location && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="shrink-0" />
            {event.location}
          </p>
        )}

        {event.description && (
          <div
            className="mt-1 line-clamp-3 text-sm text-muted-foreground [&_a]:text-rust [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        )}

        {event.ticketUrl ? (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 text-sm uppercase tracking-wide text-rust",
              "sketch-subtle group-hover/event:sketch-subtle-animated",
            )}
          >
            <Ticket size={14} />
            Get Tickets
          </a>
        ) : event.link ? (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 text-sm uppercase tracking-wide text-rust",
              "sketch-subtle group-hover/event:sketch-subtle-animated",
            )}
          >
            View on Calendar
            <ArrowUpRight size={14} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default async function Events() {
  const events = await getUpcomingEvents();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl uppercase tracking-wide">Events</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Upcoming screenings and events from DC Movie Club.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {events.length > 0 ? (
          events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <p className="text-muted-foreground">
            No upcoming events right now — check back soon!
          </p>
        )}
      </div>
    </div>
  );
}

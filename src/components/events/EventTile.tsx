import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/event-format";
import { EventTime } from "@/components/EventTime";
import { CalendarDate } from "@/components/events/CalendarDate";
import { getEventCta } from "@/components/events/event-links";
import type { CalendarEvent } from "@/types/event";

export function EventTile({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);

  const content = (
    <>
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[2.5px] border-charcoal bg-cream sketch"
      />
      <div className="relative grid h-full grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3 sm:grid-cols-[1fr_auto] sm:grid-rows-[auto_1fr] sm:items-start sm:gap-y-2 sm:p-4">
        <CalendarDate
          month={month}
          day={day}
          variant="wide"
          className="sm:col-start-1 sm:row-start-1"
        />
        <div className="flex h-full min-w-0 flex-col gap-1 sm:col-span-2 sm:row-start-2 sm:gap-2">
          <h3 className="truncate text-base uppercase leading-tight tracking-wide text-charcoal transition-colors group-hover/tile:text-rust sm:line-clamp-2 sm:text-lg sm:whitespace-normal">
            {event.title}
          </h3>
          <div className="flex min-w-0 flex-col gap-0.5 text-xs uppercase tracking-wider text-charcoal/70 sm:mt-auto">
            <span className="truncate">
              {weekday}
              {!event.allDay && (
                <>
                  {" · "}
                  <EventTime start={event.start} />
                </>
              )}
            </span>
            {event.location && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
          </div>
        </div>
        {cta && (
          <cta.icon
            size={16}
            className="shrink-0 text-rust sketch-subtle group-hover/tile:sketch-subtle-animated sm:col-start-2 sm:row-start-1 sm:self-center"
          />
        )}
        {cta && <span className="sr-only">{cta.label}</span>}
      </div>
    </>
  );

  const className =
    "group/tile relative block h-full rounded-xl transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

  return cta ? (
    <a
      href={cta.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, "hover:-rotate-1 hover:scale-102")}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

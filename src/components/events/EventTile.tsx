import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/event-format";
import { EventTime } from "@/components/EventTime";
import { CalendarDate } from "@/components/events/CalendarDate";
import { EventCtaLink } from "@/components/events/EventCtaLink";
import { getEventCta } from "@/components/events/event-links";
import { textStyles } from "@/components/textStyles";
import { SketchIcon } from "@/components/system/SketchIcon";
import { Tile } from "@/components/system/Tile";
import type { CalendarEvent } from "@/types/event";

export function EventTile({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);

  return (
    <Tile render={cta ? <EventCtaLink cta={cta} title={event.title} /> : undefined}>
      <div className="relative grid h-full grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3 sm:grid-cols-[1fr_auto] sm:grid-rows-[auto_1fr] sm:items-start sm:gap-y-2 sm:p-4">
        <CalendarDate
          month={month}
          day={day}
          variant="wide"
          className="sm:col-start-1 sm:row-start-1"
        />
        <div className="flex h-full min-w-0 flex-col gap-1 sm:col-span-2 sm:row-start-2 sm:gap-2">
          <h3
            className={cn(
              textStyles.tileTitle,
              "truncate transition-colors group-hover/tile:text-rust sm:line-clamp-2 sm:whitespace-normal",
            )}
          >
            {event.title}
          </h3>
          <div
            className={cn(
              "flex min-w-0 flex-col gap-0.5 sm:mt-auto",
              textStyles.tileMeta,
            )}
          >
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
          <SketchIcon
            icon={cta.icon}
            size={16}
            redraw="tile"
            className="shrink-0 text-rust sm:col-start-2 sm:row-start-1 sm:self-center"
          />
        )}
        {cta && <span className="sr-only">{cta.label}</span>}
      </div>
    </Tile>
  );
}

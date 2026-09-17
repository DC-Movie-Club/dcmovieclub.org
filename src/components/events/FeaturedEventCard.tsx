import { CalendarDays, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/event-format";
import { ExternalLink } from "@/components/ui/link";
import { EventTime } from "@/components/EventTime";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { CalendarDate } from "@/components/events/CalendarDate";
import { getEventCta, getMapUrl } from "@/components/events/event-links";
import { CardSurface } from "@/components/CardSurface";
import type { CalendarEvent } from "@/types/event";

// TODO: detect if the featured event is sold out via Ticket Tailor API and
// either filter it away or display it differently (e.g. "Sold Out" badge,
// moved to a separate section). For now we always show the first upcoming event.

export function FeaturedEventCard({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);
  const mapUrl = getMapUrl(event.location);

  return (
    <div className="group/card relative">
      <CardSurface className={cn(cta && "card-hover:stroke-orange-dark")} />

      {/* Stretched link makes the whole card clickable; the pill below is the
          focusable CTA, so this one stays out of the tab order. */}
      {cta && (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 rounded-2xl"
        />
      )}

      <div className="pointer-events-none absolute -top-5 left-6 z-10 -rotate-4 sm:-top-6 sm:left-8">
        <span
          className={cn(
            "font-dcmc text-4xl uppercase leading-none tracking-wide text-cream outlined-lettering outline-ink-page-ink sm:text-5xl",
            cta && "card-hover:outline-ink-orange-dark",
          )}
        >
          Next Up
        </span>
      </div>

      <div className="pointer-events-none relative flex items-start gap-4 px-5 pt-10 pb-8 sm:gap-5 sm:px-6 sm:pt-12 sm:pb-9">
        <CalendarDate month={month} day={day} variant="tall" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-2xl uppercase leading-tight tracking-wide text-charcoal sm:text-3xl">
            {event.title}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm uppercase tracking-wider text-charcoal/70">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} className="shrink-0" />
              {weekday}
            </span>
            {!event.allDay && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="shrink-0" />
                <EventTime start={event.start} end={event.end} />
              </span>
            )}
            {event.location && mapUrl && (
              <ExternalLink
                href={mapUrl}
                className="pointer-events-auto flex items-center gap-1.5 underline decoration-charcoal/30 underline-offset-4 hover:decoration-rust"
              >
                <MapPin size={14} className="shrink-0" />
                {event.location}
              </ExternalLink>
            )}
          </div>

          {event.description && (
            <ExpandableDescription
              html={event.description}
              className="mt-2 border-t border-dashed border-charcoal/20 pt-3 text-sm text-charcoal/85 [&_a]:pointer-events-auto [&_a]:text-charcoal/60 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-charcoal"
              actionClassName="pointer-events-auto absolute bottom-0 left-1/2 mt-0 -translate-x-1/2 translate-y-1/2"
            />
          )}
        </div>
      </div>

      {cta && (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-0 right-4 z-10 block -translate-y-1/2 rounded-full transition-transform card-hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-6"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-[3px] border-orange-dark bg-orange shadow-lg sketch card-hover:sketch-animated"
          />
          <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-orange-dark sm:px-6 sm:py-3 sm:text-base">
            <cta.icon size={18} className="shrink-0" />
            {cta.label}
          </span>
        </a>
      )}
    </div>
  );
}

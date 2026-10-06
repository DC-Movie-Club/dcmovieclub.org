import { CalendarDays, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/event-format";
import { ExternalLink } from "@/components/ui/link";
import { EventTime } from "@/components/EventTime";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { CalendarDate } from "@/components/events/CalendarDate";
import { EventCtaLink } from "@/components/events/EventCtaLink";
import { getEventCta, getMapUrl } from "@/components/events/event-links";
import { CardSurface } from "@/components/CardSurface";
import { textStyles } from "@/components/textStyles";
import {
  CardEdgeFace,
  CardLabel,
  cardEdgeClassName,
} from "@/components/section-cards";
import type { CalendarEvent } from "@/types/event";

// TODO: detect if the featured event is sold out via Ticket Tailor API and
// either filter it away or display it differently (e.g. "Sold Out" badge,
// moved to a separate section). For now we always show the first upcoming event.

export function FeaturedEventCard({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);
  const mapUrl = getMapUrl(event.location);

  return (
    <div className="group/card relative flex flex-col items-start">
      <CardSurface className={cn(cta && "card-hover:stroke-page-accent-edge")} />

      {/* Stretched link makes the whole card clickable; the pill below is the
          focusable CTA, so this one stays out of the tab order. */}
      {cta && (
        <EventCtaLink
          cta={cta}
          title={event.title}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 rounded-2xl"
        />
      )}

      <CardLabel
        as="p"
        className={cn(
          "pointer-events-none",
          cta && "card-hover:outline-ink-page-accent-edge",
        )}
      >
        Next Up
      </CardLabel>

      <div className="pointer-events-none relative flex items-start gap-4 self-stretch px-5 pt-4 pb-8 sm:gap-5 sm:px-6 sm:pb-9">
        <CalendarDate month={month} day={day} variant="tall" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className={textStyles.cardTitle}>
            {event.title}
          </h2>

          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-1",
              textStyles.cardMeta,
            )}
          >
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
                className="pointer-events-auto flex items-center gap-1.5 underline decoration-page-card-text/30 underline-offset-4 hover:decoration-rust"
              >
                <MapPin size={14} className="shrink-0" />
                {event.location}
              </ExternalLink>
            )}
          </div>

          {event.description && (
            <ExpandableDescription
              html={event.description}
              className={cn(
                "mt-2 border-t border-dashed border-charcoal/20 pt-3 [&_a]:pointer-events-auto",
                textStyles.cardNote,
                textStyles.htmlLinks,
              )}
              actionClassName="pointer-events-auto absolute bottom-0 left-1/2 mt-0 -translate-x-1/2 translate-y-1/2"
            />
          )}
        </div>
      </div>

      {cta && (
        <EventCtaLink
          cta={cta}
          title={event.title}
          className={cardEdgeClassName}
        >
          <CardEdgeFace>
            <cta.icon size={18} className="shrink-0" />
            {cta.label}
          </CardEdgeFace>
        </EventCtaLink>
      )}
    </div>
  );
}

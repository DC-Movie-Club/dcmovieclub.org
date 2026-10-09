import { CalendarDays, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEventDate } from "@/lib/event-format";
import { TextLink } from "@/components/system/SmartLink";
import { EventTime } from "@/components/events/EventTime";
import { ExpandableDescription } from "@/components/system/ExpandableDescription";
import { CalendarDate } from "@/components/system/CalendarDate";
import { EventCtaLink } from "@/components/events/EventCtaLink";
import { getEventCta, getMapUrl } from "@/components/events/event-links";
import { textStyles } from "@/components/system/textStyles";
import { Card } from "@/components/system/Card";
import { CardAction } from "@/components/system/Pill";
import type { CalendarEvent } from "@/types/event";

// TODO: detect if the featured event is sold out via Ticket Tailor API and
// either filter it away or display it differently (e.g. "Sold Out" badge,
// moved to a separate section). For now we always show the first upcoming event.

export function FeaturedEventCard({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);
  const mapUrl = getMapUrl(event.location);

  return (
    // The whole card links to the CTA too; the corner pill is the focusable
    // one, so the card's link stays out of the tab order
    <Card
      label="Next Up"
      labelAs="p"
      link={cta ? <EventCtaLink cta={cta} title={event.title} /> : undefined}
      action={
        cta && (
          <CardAction
            icon={cta.icon}
            render={<EventCtaLink cta={cta} title={event.title} />}
          >
            {cta.label}
          </CardAction>
        )
      }
    >
      <div className="flex items-start gap-4 sm:gap-5">
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
              <TextLink
                href={mapUrl}
                className="pointer-events-auto flex items-center gap-1.5 underline decoration-page-card-text/30 underline-offset-4 hover:decoration-rust"
              >
                <MapPin size={14} className="shrink-0" />
                {event.location}
              </TextLink>
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
    </Card>
  );
}

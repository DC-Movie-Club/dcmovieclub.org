import Image from "next/image";
import NextLink from "next/link";
import {
  MapPin,
  Clock,
  CalendarDays,
  Ticket,
  ArrowUpRight,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUpcomingEvents } from "@/lib/data";
import { getRecentLetterboxdReviews } from "@/lib/data";
import { ExternalLink } from "@/components/ui/link";
import { socials } from "@/config/navigation";
import { formatEventDate } from "@/lib/event-format";
import { EventTime } from "@/components/EventTime";
import type { CalendarEvent } from "@/types/event";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { RecentlyWatchedRail } from "@/components/RecentlyWatchedRail";

const UPCOMING_TILE_COUNT = 3;

function getMapUrl(location: string | null) {
  return location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : null;
}

function getEventCta(
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

// TODO: detect if the featured event is sold out via Ticket Tailor API and
// either filter it away or display it differently (e.g. "Sold Out" badge,
// moved to a separate section). For now we always show the first upcoming event.

const NEXT_UP_SHADOW = [
  "2px 2px 0 var(--next-up-ink)",
  "3px 3px 0 var(--next-up-ink)",
  "4px 4px 0 var(--next-up-ink)",
  "5px 5px 0 var(--next-up-ink)",
].join(", ");

const CALENDAR_VARIANTS = {
  tall: {
    key: "tall",
    width: "w-18 sm:w-22",
    radius: "rounded-lg",
    border: "border-[2.5px]",
    shadow: "translate-x-1 translate-y-1",
    direction: "flex-col",
    strip: "h-8 sm:h-9",
    month: "h-8 pt-0.5 text-base sm:h-9 sm:text-lg",
    day: "py-2 text-center text-4xl sm:text-5xl",
  },
  wide: {
    key: "wide",
    width: "w-fit",
    radius: "rounded",
    border: "border-[1.5px]",
    shadow: null,
    direction: "flex-row",
    strip: "w-9",
    month: "w-9 text-[11px]",
    day: "flex items-center px-1.5 pt-1.5 pb-0.5 text-sm",
  },
} as const;

function CalendarDate({
  month,
  day,
  variant,
  className,
}: {
  month: string;
  day: string;
  variant: keyof typeof CALENDAR_VARIANTS;
  className?: string;
}) {
  const v = CALENDAR_VARIANTS[variant];

  return (
    <div className={cn("relative shrink-0", v.width, className)}>
      {v.shadow && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-charcoal sketch-subtle",
            v.radius,
            v.shadow,
          )}
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 flex overflow-hidden border-charcoal bg-cream sketch-subtle",
          v.direction,
          v.radius,
          v.border,
        )}
      >
        <div className={cn("bg-rust", v.strip)} />
      </div>
      {/* Transparent border matches the face's border so the month text
          lines up with the rust strip inside it. */}
      <div
        className={cn("relative flex border-transparent", v.direction, v.border)}
      >
        <span
          className={cn(
            "flex items-center justify-center leading-none uppercase tracking-widest text-cream",
            v.month,
          )}
        >
          {month}
        </span>
        <span className={cn("leading-none text-charcoal", v.day)}>{day}</span>
      </div>
    </div>
  );
}

function FeaturedEvent({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatEventDate(event);
  const cta = getEventCta(event);
  const mapUrl = getMapUrl(event.location);

  return (
    <div className="group/card relative">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-2xl border-[3px] border-charcoal bg-cream shadow-xl transition-colors sketch",
          cta && "card-hover:border-orange-dark",
        )}
      />

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
            "font-dcmc text-4xl uppercase leading-none tracking-wide text-cream [--next-up-ink:var(--color-charcoal)] sm:text-5xl",
            cta && "card-hover:[--next-up-ink:var(--color-orange-dark)]",
          )}
          style={{
            textShadow: NEXT_UP_SHADOW,
            WebkitTextStroke: "1.5px var(--next-up-ink)",
            paintOrder: "stroke fill",
          }}
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

function EventTile({ event }: { event: CalendarEvent }) {
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

function EventsSection({ events }: { events: CalendarEvent[] }) {
  const [featured, ...rest] = events;
  const upcoming = rest.slice(0, UPCOMING_TILE_COUNT);

  return (
    <section className="bg-teal px-6 pt-16 pb-14">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <FeaturedEvent event={featured} />

        {upcoming.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl uppercase tracking-wide text-cream sm:text-2xl">
                Also coming up
              </h2>
              <NextLink
                href="/events"
                className="group/view-all relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-cream/70 transition-colors sketch-subtle group-hover/view-all:border-cream group-hover/view-all:bg-cream group-hover/view-all:sketch-subtle-animated"
                />
                <span className="relative flex items-center gap-1.5 px-4 py-2 text-sm uppercase tracking-widest text-cream transition-colors group-hover/view-all:text-charcoal">
                  View all
                  <ArrowRight size={14} />
                </span>
              </NextLink>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <EventTile event={event} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default async function Home() {
  const [events, reviews] = await Promise.all([
    getUpcomingEvents(),
    getRecentLetterboxdReviews(),
  ]);

  return (
    <div className="flex flex-col gap-10 pb-10">
      <section className="flex justify-center px-6 pt-12">
        <Image
          src="/images/dcmc-logo.svg"
          alt="DC Movie Club"
          width={810}
          height={810}
          priority
          className="h-auto w-56 sm:w-72"
        />
      </section>

      <div className="flex items-center justify-center gap-4">
        {Object.values(socials).map((link) => (
          <ExternalLink
            key={link.key}
            href={link.href}
            className="sketch-subtle text-muted-foreground transition-colors hover:text-rust"
          >
            <link.icon size={24} />
          </ExternalLink>
        ))}
      </div>

      {events.length > 0 && <EventsSection events={events} />}

      {reviews.length > 0 && <RecentlyWatchedRail reviews={reviews} />}
    </div>
  );
}

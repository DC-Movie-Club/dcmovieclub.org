import Image from "next/image";
import {
  MapPin,
  Clock,
  CalendarDays,
  Ticket,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUpcomingEvents, getPastEventCount } from "@/lib/data";
import { getRecentLetterboxdReviews } from "@/lib/data";
import { Link, ExternalLink } from "@/components/ui/link";
import { socials } from "@/config/navigation";
import type { CalendarEvent } from "@/types/event";
import { DieCutSticker } from "@/components/DieCutSticker";
import { TextSticker } from "@/components/TextSticker";
import { CountTicker } from "@/components/CountTicker";
import { HomeBackgroundArt } from "@/components/HomeBackgroundArt";
import { ExpandableDescription } from "@/components/ExpandableDescription";
import { RecentlyWatchedRail } from "@/components/RecentlyWatchedRail";
import { StickerPlayground } from "./StickerPlayground";

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

// TODO: detect if the featured event is sold out via Ticket Tailor API and
// either filter it away or display it differently (e.g. "Sold Out" badge,
// moved to a separate section). For now we always show the first upcoming event.

const NEXT_UP_SHADOW = [
  "2px 2px 0 var(--color-charcoal)",
  "3px 3px 0 var(--color-charcoal)",
  "4px 4px 0 var(--color-charcoal)",
  "5px 5px 0 var(--color-charcoal)",
].join(", ");

function FeaturedEvent({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatDate(event.start);
  const mapUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  return (
    <section className="px-6 pt-5 pb-2">
      <div className="relative mx-auto max-w-3xl">
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl border-[3px] border-charcoal sketch"
          style={{ backgroundColor: "#2a4a5e" }}
        />

        <div className="pointer-events-none absolute -top-5 left-6 z-10 -rotate-[4deg] sm:-top-6 sm:left-8">
          <span
            className="font-dcmc text-4xl uppercase leading-none tracking-wide text-cream sm:text-5xl"
            style={{
              textShadow: NEXT_UP_SHADOW,
              WebkitTextStroke: "1.5px var(--color-charcoal)",
              paintOrder: "stroke fill",
            }}
          >
            Next Up
          </span>
        </div>

        <div className="relative flex px-5 pt-10 pb-5 sm:px-6 sm:pt-12 sm:pb-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative shrink-0 shadow-md">
              <div
                aria-hidden
                className="absolute inset-0 rounded-lg bg-cream sketch"
              />
              <div className="relative flex flex-col items-center px-4 py-3 text-center">
                <span className="text-sm font-medium uppercase tracking-widest text-rust">
                  {month}
                </span>
                <span className="text-4xl leading-none text-rust">{day}</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h2 className="text-2xl uppercase leading-tight tracking-wide text-cream sm:text-3xl">
                {event.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm uppercase tracking-wider text-cream/75">
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} className="shrink-0" />
                  {weekday}
                </span>
                {!event.allDay && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="shrink-0" />
                    {formatTimeRange(event.start, event.end)}
                  </span>
                )}
                {event.location && mapUrl && (
                  <ExternalLink
                    href={mapUrl}
                    className="flex items-center gap-1.5 underline underline-offset-4 decoration-cream/50 hover:text-cream! hover:decoration-cream"
                  >
                    <MapPin size={14} className="shrink-0" />
                    {event.location}
                  </ExternalLink>
                )}
              </div>

              {event.description && (
                <ExpandableDescription
                  html={event.description}
                  className="mt-2 border-t border-dashed border-cream/25 pt-3 text-sm text-cream/90 [&_a]:text-cream [&_a]:underline"
                  actionClassName="text-orange"
                />
              )}
            </div>
          </div>
        </div>

        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta absolute top-0 right-4 z-10 block -translate-y-1/2 transition-transform hover:scale-105 sm:right-6"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-[3px] border-charcoal bg-orange shadow-lg sketch group-hover/cta:sketch-animated"
            />
            <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-charcoal sm:px-6 sm:py-3 sm:text-base">
              <Ticket size={18} className="shrink-0" />
              Get Tickets
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

function CompactEventCard({ event }: { event: CalendarEvent }) {
  const { month, day } = formatDate(event.start);

  return (
    <div className="group/event flex items-center gap-4 rounded-lg border-2 border-charcoal/10 px-4 py-3 transition-colors hover:border-charcoal/20">
      <div className="flex shrink-0 flex-col items-center text-center">
        <span className="text-[10px] font-medium uppercase tracking-widest text-rust">
          {month}
        </span>
        <span className="text-xl leading-tight text-rust">{day}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-base uppercase tracking-wide">
          {event.title}
        </h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          {!event.allDay && <span>{formatTime(event.start)}</span>}
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={10} className="shrink-0" />
              {event.location}
            </span>
          )}
        </div>
      </div>

      {event.ticketUrl ? (
        <ExternalLink
          href={event.ticketUrl}
          className={cn(
            "shrink-0 text-rust",
            "sketch-subtle group-hover/event:sketch-subtle-animated",
          )}
        >
          <Ticket size={18} />
        </ExternalLink>
      ) : event.link ? (
        <ExternalLink
          href={event.link}
          className="shrink-0 text-muted-foreground"
        >
          <ArrowUpRight size={18} />
        </ExternalLink>
      ) : null}
    </div>
  );
}

function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {events.map((event) => (
            <CompactEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [events, reviews, pastEventCount] = await Promise.all([
    getUpcomingEvents(),
    getRecentLetterboxdReviews(),
    getPastEventCount(),
  ]);

  const [featuredEvent, ...remainingEvents] = events;

  return (
    <div className="relative isolate flex flex-col gap-10 pb-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <HomeBackgroundArt className="top-[25svh]" />
      </div>
      <StickerPlayground
        stickers={[
          {
            id: "logo",
            initialX: -46.4,
            initialY: 196,
            initialRotate: -15,
            initialScale: 1,
            initialZ: 130,
            element: (
              <DieCutSticker radius={6} elevation="l2">
                <Image
                  src="/images/dcmc-logo.png"
                  alt="DC Movie Club"
                  width={180}
                  height={180}
                  priority
                />
              </DieCutSticker>
            ),
          },
          {
            id: "tagline",
            initialX: -27.2,
            initialY: 325,
            initialRotate: -4,
            initialScale: 1,
            initialZ: 131,
            element: (
              <DieCutSticker radius={1} elevation="l2" outlineColor="#d4cbb0">
                <svg
                  viewBox="0 0 560 120"
                  className="w-[380px] max-w-full"
                  role="img"
                  aria-label="An inclusive and (mostly) unpretentious club to discuss movies and make friends!"
                >
                  <defs>
                    <filter
                      id="sprocket-shadow"
                      x="-20%"
                      y="-40%"
                      width="140%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="0.8"
                        stdDeviation="0.6"
                        floodColor="#5a543e"
                        floodOpacity="0.3"
                      />
                    </filter>
                  </defs>
                  <rect width="560" height="120" rx="6" fill="#efecdf" />
                  {Array.from({ length: 32 }, (_, i) => {
                    const x = 5 + i * 17.5;
                    return (
                      <g key={i} filter="url(#sprocket-shadow)">
                        <rect
                          x={x}
                          y={4}
                          width={10}
                          height={7}
                          rx={2}
                          fill="#c9c1a5"
                        />
                        <rect
                          x={x}
                          y={109}
                          width={10}
                          height={7}
                          rx={2}
                          fill="#c9c1a5"
                        />
                      </g>
                    );
                  })}
                  <text
                    x="280"
                    y="45"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#393a3e"
                    fontFamily="var(--font-dcmc)"
                    fontSize="25"
                    letterSpacing="1"
                  >
                    DC's inclusive and (mostly) unpretentious club
                  </text>
                  <text
                    x="280"
                    y="78"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#393a3e"
                    fontFamily="var(--font-dcmc)"
                    fontSize="25"
                    letterSpacing="1"
                  >
                    for discussing movies and making friends!
                  </text>
                </svg>
              </DieCutSticker>
            ),
          },
          {
            id: "est",
            initialX: -33.1,
            initialY: 403,
            initialRotate: 5,
            initialScale: 1.5,
            initialZ: 132,
            element: (
              <TextSticker
                color="#be7184"
                strokeWidth={7}
                elevation="l2"
                className="text-2xl uppercase -tracking-[3px]"
              >
                Est 2023
              </TextSticker>
            ),
          },
          {
            id: "audience",
            initialX: 21.8,
            initialY: 165,
            initialRotate: 8,
            initialScale: 0.8,
            initialZ: 126,
            element: (
              <DieCutSticker radius={5} elevation="l2" outlineColor="white">
                <div
                  className="flex items-center justify-center overflow-hidden rounded-sm"
                  style={{ backgroundColor: "#6672ab" }}
                >
                  <Image
                    src="/images/audience-white.png"
                    alt="Movie audience illustration"
                    width={180}
                    height={118}
                    className="h-auto w-auto object-cover"
                  />
                </div>
              </DieCutSticker>
            ),
          },
          {
            id: "events",
            initialX: 17.3,
            initialY: 390,
            initialRotate: -8,
            initialScale: 1.1,
            initialZ: 133,
            element:
              pastEventCount > 0 ? (
                <DieCutSticker radius={2} elevation="l2" outlineColor="#b4731e">
                  <div className="flex items-center gap-2 rounded-lg bg-orange px-3 py-2">
                    <CountTicker
                      value={pastEventCount}
                      behind={3}
                      color="cream"
                    />
                    <span className="text-sm uppercase tracking-wide leading-none text-charcoal">
                      events and counting...
                    </span>
                  </div>
                </DieCutSticker>
              ) : null,
          },
        ]}
      />

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

      {featuredEvent && <FeaturedEvent event={featuredEvent} />}

      {reviews.length > 0 && <RecentlyWatchedRail reviews={reviews} />}

      {remainingEvents.length > 0 && (
        <UpcomingEvents events={remainingEvents} />
      )}
    </div>
  );
}

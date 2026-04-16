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
import { Letterboxd } from "@/components/icons/Letterboxd";
import { ParagraphLong } from "@/components/icons/ParagraphLong";
import { ParagraphShort } from "@/components/icons/ParagraphShort";
import type { CalendarEvent } from "@/types/event";
import type { LetterboxdReview } from "@/types/letterboxd";
import { DieCutSticker } from "@/components/DieCutSticker";
import { TextSticker } from "@/components/TextSticker";
import { CountTicker } from "@/components/CountTicker";

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

function FeaturedEvent({ event }: { event: CalendarEvent }) {
  const { month, day, weekday } = formatDate(event.start);

  return (
    <section className="px-6">
      <div className="mx-auto max-w-3xl">
        <div className="group/event overflow-hidden rounded-xl border-2 border-charcoal/15 transition-colors hover:border-charcoal/30">
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Next Event
            </p>

            <div className="flex items-start gap-5">
              <div className="flex shrink-0 flex-col items-center rounded-lg bg-rust/10 px-4 py-3 text-center">
                <span className="text-sm font-medium uppercase tracking-widest text-rust">
                  {month}
                </span>
                <span className="text-4xl leading-tight text-rust">{day}</span>
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <h2 className="text-2xl uppercase tracking-wide sm:text-3xl">
                  {event.title}
                </h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="shrink-0" />
                      {event.location}
                    </span>
                  )}
                </div>

                {event.description && (
                  <div
                    className="mt-1 line-clamp-3 text-sm text-muted-foreground [&_a]:text-rust [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}

                {event.ticketUrl && (
                  <ExternalLink
                    href={event.ticketUrl}
                    className={cn(
                      "mt-2 inline-flex items-center gap-1.5 text-sm uppercase tracking-wide text-rust",
                      "sketch-subtle group-hover/event:sketch-subtle-animated",
                    )}
                  >
                    <Ticket size={14} />
                    Get Tickets
                  </ExternalLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatRating(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return "★".repeat(full) + (half ? "½" : "");
}

function LetterboxdRail({ reviews }: { reviews: LetterboxdReview[] }) {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Letterboxd size={18} className="text-muted-foreground" />
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground">
              Recently Watched
            </h2>
          </div>
          <ExternalLink
            href="https://letterboxd.com/dcmovieclub/diary/"
            className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground"
          >
            See all
            <ArrowUpRight size={12} />
          </ExternalLink>
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {reviews.map((review) => (
            <ExternalLink
              key={review.id}
              href={review.url}
              className="group/poster relative flex-none"
            >
              <div className="w-[100px] overflow-hidden rounded-lg sm:w-[120px]">
                {review.posterUrl ? (
                  <img
                    src={review.posterUrl}
                    alt={review.filmTitle}
                    className="aspect-poster w-full object-cover transition-transform group-hover/poster:scale-105"
                  />
                ) : (
                  <div className="flex aspect-poster w-full items-center justify-center bg-muted p-2 text-center text-xs text-muted-foreground">
                    {review.filmTitle}
                  </div>
                )}
              </div>
              {review.rating !== null && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full border border-charcoal/10 bg-surface px-1.5 py-0.5 text-xs text-rust shadow-sm">
                  {formatRating(review.rating)}
                </div>
              )}
              {review.review && (
                <div className="absolute -bottom-1 right-1 rounded-full border border-charcoal/10 bg-surface px-1 text-muted-foreground shadow-sm">
                  {review.review.length < 300 ? (
                    <ParagraphShort size={14} />
                  ) : (
                    <ParagraphLong size={14} />
                  )}
                </div>
              )}
            </ExternalLink>
          ))}
        </div>
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
    <div className="flex flex-col gap-10 py-10">
      <div className="flex flex-col items-center gap-6 px-6">
        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
          <DieCutSticker
            radius={6}
            elevation="l2"
            rotate={-5}
            className="z-10 sm:-mr-6 sm:mt-6"
          >
            <Image
              src="/images/dcmc-logo.png"
              alt="DC Movie Club"
              width={180}
              height={180}
              priority
            />
          </DieCutSticker>

          <div className="flex flex-col items-center gap-4 sm:-ml-4 sm:items-start">
            <DieCutSticker
              radius={1}
              elevation="l2"
              outlineColor="#45586a"
              rotate={2}
            >
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
                      floodColor="#1e2a35"
                      floodOpacity="0.4"
                    />
                  </filter>
                </defs>
                <rect width="560" height="120" rx="6" fill="#45586a" />
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
                        fill="#8a9caa"
                      />
                      <rect
                        x={x}
                        y={109}
                        width={10}
                        height={7}
                        rx={2}
                        fill="#8a9caa"
                      />
                    </g>
                  );
                })}
                <text
                  x="280"
                  y="45"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#d4dce2"
                  stroke="#2e3d4a"
                  strokeWidth="0.6"
                  paintOrder="stroke fill"
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
                  fill="#d4dce2"
                  stroke="#2e3d4a"
                  strokeWidth="0.6"
                  paintOrder="stroke fill"
                  fontFamily="var(--font-dcmc)"
                  fontSize="25"
                  letterSpacing="1"
                >
                  for discussing movies and making friends!
                </text>
              </svg>
            </DieCutSticker>

            <TextSticker
              color="#be7184"
              strokeWidth={7}
              elevation="l2"
              rotate={-3}
              className="text-2xl uppercase -tracking-[3px] sm:ml-12"
            >
              Est 2023
            </TextSticker>

            <DieCutSticker
              radius={5}
              elevation="l2"
              outlineColor="white"
              rotate={3}
              className="sm:ml-4"
            >
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
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {pastEventCount > 0 && (
            <DieCutSticker
              radius={2}
              elevation="l2"
              rotate={-2}
              outlineColor="#b4731e"
            >
              <div className="flex items-center gap-2 rounded-lg bg-orange px-3 py-2">
                <CountTicker value={pastEventCount} behind={3} color="cream" />
                <span className="text-sm uppercase tracking-wide leading-none text-charcoal">
                  events and counting...
                </span>
              </div>
            </DieCutSticker>
          )}
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
        </div>
      </div>

      {featuredEvent && <FeaturedEvent event={featuredEvent} />}

      {reviews.length > 0 && <LetterboxdRail reviews={reviews} />}

      {remainingEvents.length > 0 && (
        <UpcomingEvents events={remainingEvents} />
      )}
    </div>
  );
}

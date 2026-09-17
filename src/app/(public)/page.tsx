import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import { getUpcomingEvents } from "@/lib/data";
import { getRecentLetterboxdReviews } from "@/lib/data";
import { ExternalLink } from "@/components/ui/link";
import { socials } from "@/config/navigation";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import type { CalendarEvent } from "@/types/event";
import { RecentlyWatchedRail } from "@/components/RecentlyWatchedRail";
import { AudienceMarquee } from "@/components/AudienceMarquee";
import { cn } from "@/lib/utils";

const UPCOMING_TILE_COUNT = 3;

function TaglineBanner({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("relative px-3 py-1.5 text-balance sm:px-5 sm:py-2.5", className)}>
      {/* Separate shadow layer: an offset box-shadow would be clipped by the
          sketch filter's region */}
      <span
        aria-hidden
        className="absolute inset-0 translate-x-1 translate-y-1 bg-teal sketch sm:translate-x-1.5 sm:translate-y-1.5"
      />
      <span aria-hidden className="absolute inset-0 bg-purple sketch" />
      <span className="relative">{children}</span>
    </span>
  );
}

function EventsSection({ events }: { events: CalendarEvent[] }) {
  const [featured, ...rest] = events;
  const upcoming = rest.slice(0, UPCOMING_TILE_COUNT);

  return (
    <section className="bg-teal px-6 pt-16 pb-14">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <FeaturedEventCard event={featured} />

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
      <section className="flex flex-col items-center pt-8">
        <AudienceMarquee />
        <h1 className="relative -mt-4 px-4 text-center text-[15vw] whitespace-nowrap uppercase leading-none text-teal sm:-mt-9 sm:text-8xl">
          DC Movie Club
        </h1>
        <p className="mt-5 flex flex-col items-center px-4 text-center text-base uppercase tracking-wide text-cream sm:mt-7 sm:text-xl">
          <TaglineBanner className="-rotate-2">
            DC’s inclusive and
            <span className="max-sm:hidden"> (mostly) unpretentious community</span>
          </TaglineBanner>
          <TaglineBanner className="rotate-2 sm:hidden">
            (mostly) unpretentious community
          </TaglineBanner>
          <TaglineBanner className="-rotate-3 sm:rotate-2">
            to discuss movies and make friends!
          </TaglineBanner>
        </p>
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

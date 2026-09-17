import Image from "next/image";
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

const UPCOMING_TILE_COUNT = 3;

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

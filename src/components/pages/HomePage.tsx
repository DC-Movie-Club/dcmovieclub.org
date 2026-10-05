import NextLink from "next/link";
import { ArrowRight } from "lucide-react";
import type { PageSection, PageView } from "@/lib/pages";
import { ExternalLink } from "@/components/ui/link";
import { socials } from "@/config/navigation";
import {
  colorVars,
  pageTemplates,
  type PageColors,
  type SectionKind,
} from "@/config/pages";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { Markdown } from "@/components/Markdown";
import { SectionCard } from "@/components/section-cards";
import type { CalendarEvent } from "@/types/event";
import type { LetterboxdReview } from "@/types/letterboxd";
import { RecentlyWatchedRail } from "@/components/RecentlyWatchedRail";
import { AudienceMarquee } from "@/components/AudienceMarquee";
import { LogoLettering } from "@/components/LogoLettering";
import { SiteFooter } from "@/components/SiteFooter";
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
        className="absolute inset-0 translate-x-1 translate-y-1 bg-page-accent-edge sketch sm:translate-x-1.5 sm:translate-y-1.5"
      />
      <span aria-hidden className="absolute inset-0 bg-page-accent sketch" />
      <span className="relative">{children}</span>
    </span>
  );
}

function Hero() {
  return (
    <>
      <section className="flex flex-col items-center pt-8">
        <AudienceMarquee />
        <h1 className="relative w-full max-w-225 px-4">
          <span className="sr-only">DC Movie Club</span>
          <LogoLettering layout="stacked" className="sm:hidden" />
          <LogoLettering layout="row" className="max-sm:hidden" />
        </h1>
        <p className="mt-5 flex flex-col items-center gap-0.5 px-4 text-center text-base uppercase tracking-wide text-page-accent-text sm:mt-7 sm:gap-1 sm:text-xl">
          <TaglineBanner className="-rotate-2">
            DC’s inclusive and
            <span className="max-sm:hidden"> (mostly) unpretentious community</span>
          </TaglineBanner>
          <TaglineBanner className="rotate-1 sm:hidden">
            (mostly) unpretentious community
          </TaglineBanner>
          <TaglineBanner className="-rotate-1 sm:rotate-[1.5deg]">
            for discussing movies and making friends!
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
    </>
  );
}

// An outlined pill in the page's text color that fills in on hover
function OutlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      href={href}
      className="group/outline relative shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-page-fg/70 transition-colors sketch-subtle group-hover/outline:border-page-fg group-hover/outline:bg-page-fg group-hover/outline:sketch-subtle-animated"
      />
      <span className="relative flex items-center gap-1.5 px-4 py-2 text-sm uppercase tracking-widest text-page-fg transition-colors group-hover/outline:text-charcoal">
        {children}
        <ArrowRight size={14} />
      </span>
    </NextLink>
  );
}

// In the Events page's colors
function EventsSection({
  events,
  colors,
}: {
  events: CalendarEvent[];
  colors: PageColors;
}) {
  const [featured, ...rest] = events;
  if (!featured) return null;
  const upcoming = rest.slice(0, UPCOMING_TILE_COUNT);

  return (
    <section className="bg-page-bg px-6 pt-16 pb-14" style={colorVars(colors)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <FeaturedEventCard event={featured} />

        {upcoming.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl uppercase tracking-wide text-page-fg sm:text-2xl">
                Also coming up
              </h2>
              <OutlineLink href={pageTemplates.events.href}>View all</OutlineLink>
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

function pageSection<K extends SectionKind>(
  page: PageView,
  template: { key: string; kind: K },
) {
  const section = page.sections.find((s) => s.key === template.key);
  return section?.kind === template.kind
    ? (section as PageSection & { kind: K })
    : null;
}

// In the About page's colors: its Mission, then the Partnerships page's
// partner list
function AboutSection({
  about,
  partnerships,
}: {
  about: PageView;
  partnerships: PageView | null;
}) {
  const mission = pageSection(about, pageTemplates.about.sections.mission);
  const partners =
    partnerships &&
    pageSection(partnerships, pageTemplates.partnerships.sections.partners);

  return (
    <section className="bg-page-bg px-6 py-16" style={colorVars(about.colors)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {mission?.content.trim() && (
          <div className="relative">
            <SectionCard label={about.title}>
              <Markdown>{mission.content}</Markdown>
            </SectionCard>
            <NextLink
              href={pageTemplates.about.href}
              className="group/more absolute top-0 right-4 z-10 block -translate-y-1/2 rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-6"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border-[3px] border-page-accent-edge bg-page-accent shadow-lg sketch group-hover/more:sketch-animated"
              />
              <span className="relative flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider text-page-accent-text sm:px-6 sm:py-3 sm:text-base">
                More about us
                <ArrowRight size={18} className="shrink-0" />
              </span>
            </NextLink>
          </div>
        )}

        {partners && partners.items.length > 0 && (
          <div className="flex flex-col gap-5 border-t-2 border-dashed border-page-fg/30 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl uppercase tracking-wide text-page-fg sm:text-2xl">
                {partners.label}
              </h2>
              <OutlineLink href={pageTemplates.partnerships.href}>
                Partner with us
              </OutlineLink>
            </div>
            <ul className="flex flex-wrap gap-2.5">
              {partners.items.map((item) => (
                <li
                  key={item.key}
                  className="relative px-3.5 py-2 text-sm uppercase leading-none tracking-wide text-charcoal"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-cream shadow-sm sketch-subtle"
                  />
                  {item.url ? (
                    <ExternalLink href={item.url} className="relative">
                      {item.title}
                    </ExternalLink>
                  ) : (
                    <span className="relative">{item.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function HomePage({
  page,
  eventsPage,
  aboutPage,
  partnershipsPage,
  events,
  reviews,
}: {
  page: PageView;
  // Upcoming events show in the Events page's colors
  eventsPage: PageView | null;
  aboutPage: PageView | null;
  partnershipsPage: PageView | null;
  events: CalendarEvent[];
  reviews: LetterboxdReview[];
}) {
  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the background runs to the bottom edge; pb-34 re-adds it.
    <div
      className="-mb-24 flex min-h-screen flex-col gap-10 bg-page-bg pb-34"
      style={colorVars(page.colors)}
    >
      <Hero />
      {/* One flex item, so no gap opens between the two colored bands */}
      <div>
        <EventsSection
          events={events}
          colors={eventsPage?.colors ?? {}}
        />
        {aboutPage && (
          <AboutSection about={aboutPage} partnerships={partnershipsPage} />
        )}
      </div>
      {reviews.length > 0 && <RecentlyWatchedRail reviews={reviews} />}
      <div className="mt-auto px-6 pt-14">
        <SiteFooter />
      </div>
    </div>
  );
}

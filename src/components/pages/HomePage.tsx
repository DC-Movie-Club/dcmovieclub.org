import { ArrowRight } from "lucide-react";
import type { PageSection, PageView } from "@/lib/pages";
import { routes } from "@/config/navigation";
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
import { TagList } from "@/components/PageSections";
import { CardAction, Pill } from "@/components/system/Pill";
import { SketchShape } from "@/components/system/SketchShape";
import { SocialLinks } from "@/components/system/SocialLinks";
import { textStyles } from "@/components/textStyles";
import type { CalendarEvent } from "@/types/event";
import type { LetterboxdReview } from "@/types/letterboxd";
import type { SubstackPost } from "@/types/post";
import { latestPost } from "@/lib/posts";
import { LatestPost } from "@/components/posts/LatestPost";
import { SubscribePlainCard } from "@/components/SubscribeDialog";
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
    <span className={cn("relative px-[0.45em] py-[0.3em] text-balance sm:px-5 sm:py-2.5", className)}>
      {/* A hard shadow layer: an offset box-shadow would be clipped by the
          sketch filter's region */}
      <SketchShape
        radius="rounded-none"
        fill="bg-page-accent"
        hardShadow="translate-x-1 translate-y-1 bg-page-accent-edge sm:translate-x-1.5 sm:translate-y-1.5"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function Hero() {
  return (
    <>
      <section className="flex flex-col items-center pt-8">
        <AudienceMarquee />
        <h1 className="relative w-full px-6">
          <span className="sr-only">DC Movie Club</span>
          <LogoLettering layout="stacked" className="mx-auto max-w-3xl sm:hidden" />
          <LogoLettering layout="row" className="mx-auto max-w-3xl max-sm:hidden" />
        </h1>
        {/* The offsets stagger the strips while keeping them, shadows
            included, centered as a group in the tagline's space. On phones
            the text scales with the title, which spans the screen less its
            padding. */}
        <p className="mt-5 flex flex-col items-center gap-0.5 px-4 text-center text-[length:calc((100vw-3rem)*0.0437)] leading-tight uppercase tracking-wide text-page-accent-text sm:mt-7 sm:gap-1 sm:text-xl sm:leading-[1.4]">
          <TaglineBanner className="-translate-x-[9px] -translate-y-[2px] -rotate-[1.3deg] sm:-translate-x-[3px] sm:-translate-y-[3px] sm:-rotate-[0.35deg]">
            DC’s inclusive and
            <span className="max-sm:hidden"> (mostly) unpretentious community</span>
          </TaglineBanner>
          <TaglineBanner className="translate-x-[2px] rotate-[0.3deg] sm:hidden">
            (mostly) unpretentious community
          </TaglineBanner>
          <TaglineBanner className="-translate-x-[2px] translate-y-[2px] -rotate-[0.5deg] sm:-translate-x-[3px] sm:translate-y-[3px] sm:rotate-[0.35deg]">
            for discussing movies and making friends!
          </TaglineBanner>
        </p>
      </section>

      <SocialLinks
        size={24}
        className="justify-center"
        linkClassName="text-muted-foreground hover:text-rust"
      />
    </>
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
              <h2 className={textStyles.pageHeading}>Also coming up</h2>
              <Pill variant="outline" href={pageTemplates.events.href} iconEnd={ArrowRight}>
                View all
              </Pill>
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

// In the Blog page's colors: the post the blog leads with, then Substack's
// signup
function NewsletterSection({
  post,
  colors,
}: {
  post: SubstackPost;
  colors: PageColors;
}) {
  return (
    <section className="bg-page-bg px-6 pt-16 pb-14" style={colorVars(colors)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className={textStyles.pageHeading}>From the newsletter</h2>
          <Pill variant="outline" href={pageTemplates.blog.href} iconEnd={ArrowRight}>
            Blog
          </Pill>
        </div>
        <LatestPost post={post} />
        <SubscribePlainCard />
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

// In the About page's colors: the home page's About text, then the
// Partnerships page's partner list
function AboutSection({
  blurb,
  about,
  partnerships,
}: {
  blurb: (PageSection & { kind: "text" }) | null;
  about: PageView;
  partnerships: PageView | null;
}) {
  const partners =
    partnerships &&
    pageSection(partnerships, pageTemplates.partnerships.sections.partners);

  return (
    <section className="bg-page-bg px-6 py-16" style={colorVars(about.colors)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {blurb?.content.trim() && (
          <div className="relative">
            <SectionCard label={blurb.label}>
              <Markdown>{blurb.content}</Markdown>
            </SectionCard>
            <CardAction
              href={pageTemplates.about.href}
              icon={routes.about.icon}
              iconEnd={ArrowRight}
            >
              More about us
            </CardAction>
          </div>
        )}

        {partners && partners.items.length > 0 && (
          <div className="flex flex-col gap-5 border-t-2 border-dashed border-page-fg/30 pt-8">
            <h2 className={textStyles.pageHeading}>{partners.label}</h2>
            <TagList items={partners.items}>
              <li className="flex">
                <Pill
                  variant="accent"
                  href={pageTemplates.partnerships.href}
                  icon={routes.partnerships.icon}
                >
                  Partner with us
                </Pill>
              </li>
            </TagList>
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
  blogPage,
  events,
  posts,
  reviews,
}: {
  page: PageView;
  // Upcoming events show in the Events page's colors
  eventsPage: PageView | null;
  aboutPage: PageView | null;
  partnershipsPage: PageView | null;
  blogPage: PageView | null;
  events: CalendarEvent[];
  posts: SubstackPost[];
  reviews: LetterboxdReview[];
}) {
  const post = latestPost(posts);

  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the background runs to the bottom edge; pb-34 re-adds it.
    <div
      className="-mb-24 flex min-h-screen flex-col gap-10 bg-page-bg pb-34"
      style={colorVars(page.colors)}
    >
      <Hero />
      {/* Colored bands back to back, without the page's cream between them */}
      <div>
        <EventsSection
          events={events}
          colors={eventsPage?.colors ?? {}}
        />
        {post && (
          <NewsletterSection post={post} colors={blogPage?.colors ?? {}} />
        )}
        {aboutPage && (
          <AboutSection
            blurb={pageSection(page, pageTemplates.home.sections.about)}
            about={aboutPage}
            partnerships={partnershipsPage}
          />
        )}
      </div>
      {reviews.length > 0 && <RecentlyWatchedRail reviews={reviews} />}
      <div className="mt-auto px-6 pt-14">
        <SiteFooter />
      </div>
    </div>
  );
}

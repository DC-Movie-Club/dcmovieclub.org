import { formatEventMonth } from "@/lib/event-format";
import type { PageView } from "@/lib/pages";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageContent, PageHeader, PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TileGrid } from "@/components/layout/TileGrid";
import { PageSections } from "@/components/PageSections";
import type { CalendarEvent } from "@/types/event";

function groupByMonth(events: CalendarEvent[]) {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const label = formatEventMonth(event);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }
  return [...groups].map(([label, events]) => ({ label, events }));
}

function UpcomingEvents({ events }: { events: CalendarEvent[] }) {
  const [featured, ...rest] = events;
  const months = groupByMonth(rest);

  return (
    <>
      {featured ? (
        <FeaturedEventCard event={featured} />
      ) : (
        <EmptyState>No upcoming events right now. Check back soon!</EmptyState>
      )}

      {months.map((month) => (
        <section key={month.label} className="flex flex-col gap-4">
          <SectionHeader title={month.label} />
          <TileGrid columns={3}>
            {month.events.map((event) => (
              <li key={event.id}>
                <EventTile event={event} />
              </li>
            ))}
          </TileGrid>
        </section>
      ))}
    </>
  );
}

export function EventsPage({
  page,
  events,
}: {
  page: PageView;
  events: CalendarEvent[];
}) {
  return (
    <PageShell colors={page.colors}>
      <PageHeader title={page.title} subtitle={page.subtitle} />
      <PageContent className="mt-14">
        <UpcomingEvents events={events} />
        <PageSections sections={page.sections} />
      </PageContent>
    </PageShell>
  );
}

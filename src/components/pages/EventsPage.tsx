import { formatEventMonth } from "@/lib/event-format";
import type { PageView } from "@/lib/pages";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { Card } from "@/components/system/Card";
import { PageSections } from "@/components/PageSections";
import { textStyles } from "@/components/textStyles";
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
        <Card>
          <p className={textStyles.cardEmpty}>
            No upcoming events right now. Check back soon!
          </p>
        </Card>
      )}

      {months.map((month) => (
        <section key={month.label} className="flex flex-col gap-4">
          <h2 className={textStyles.pageHeading}>{month.label}</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {month.events.map((event) => (
              <li key={event.id}>
                <EventTile event={event} />
              </li>
            ))}
          </ul>
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
    <ColorPage
      colors={page.colors}
      header={
        <header className="flex flex-col gap-4">
          <PageTitle>{page.title}</PageTitle>
          {page.subtitle && (
            <p className={textStyles.pageSubtitle}>{page.subtitle}</p>
          )}
        </header>
      }
      contentClassName="mt-14"
    >
      <UpcomingEvents events={events} />
      <PageSections sections={page.sections} />
    </ColorPage>
  );
}

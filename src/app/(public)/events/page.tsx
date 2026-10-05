import { getUpcomingEvents } from "@/lib/data";
import { formatEventMonth } from "@/lib/event-format";
import { getPage } from "@/lib/pages";
import { pageTemplates } from "@/config/pages";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CreamCard } from "@/components/CreamCard";
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

function UpcomingEvents({
  events,
  fields,
}: {
  events: CalendarEvent[];
  fields: Record<string, string>;
}) {
  const [featured, ...rest] = events;
  const months = groupByMonth(rest);

  return (
    <>
      {featured ? (
        <FeaturedEventCard event={featured} label={fields.featuredLabel} />
      ) : (
        <CreamCard>
          <p className="text-center text-lg uppercase tracking-wide text-charcoal/80">
            {fields.emptyMessage}
          </p>
        </CreamCard>
      )}

      {months.map((month) => (
        <section key={month.label} className="flex flex-col gap-4">
          <h2 className="text-xl uppercase tracking-wide text-page-fg sm:text-2xl">
            {month.label}
          </h2>
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

export default async function Events() {
  const [page, events] = await Promise.all([
    getPage(pageTemplates.events.key),
    getUpcomingEvents(),
  ]);

  return (
    <ColorPage colors={page.colors}>
      <header className="flex flex-col gap-4">
        <PageTitle>{page.title}</PageTitle>
        {page.subtitle && (
          <p className="text-lg uppercase tracking-wide text-page-fg/80">
            {page.subtitle}
          </p>
        )}
      </header>

      <PageSections
        sections={page.sections}
        renderers={{
          events: (fields) => <UpcomingEvents events={events} fields={fields} />,
        }}
      />
    </ColorPage>
  );
}

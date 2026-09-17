import { getUpcomingEvents } from "@/lib/data";
import { Markdown } from "@/components/Markdown";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { formatEventMonth } from "@/lib/event-format";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CreamCard } from "@/components/CreamCard";
import type { CalendarEvent } from "@/types/event";

function groupByMonth(events: CalendarEvent[]) {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const label = formatEventMonth(event);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }
  return [...groups].map(([label, events]) => ({ label, events }));
}

export default async function Events() {
  const [events, copy] = await Promise.all([
    getUpcomingEvents(),
    getCopy(copySlots.events.key),
  ]);

  const [featured, ...rest] = events;
  const months = groupByMonth(rest);

  return (
    <ColorPage className="bg-teal page-ink-teal-dark page-edge-teal-light">
      <header className="flex flex-col gap-4">
        <PageTitle>Events</PageTitle>
        <p className="text-lg uppercase tracking-wide text-cream/80">
          Screenings, happy hours, and hangouts around DC
        </p>
      </header>

      {featured ? (
        <FeaturedEventCard event={featured} />
      ) : (
        <CreamCard>
          <p className="text-center text-lg uppercase tracking-wide text-charcoal/80">
            No upcoming events right now. Check back soon!
          </p>
        </CreamCard>
      )}

      {months.map((month) => (
        <section key={month.label} className="flex flex-col gap-4">
          <h2 className="text-xl uppercase tracking-wide text-cream sm:text-2xl">
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

      {copy.content.trim() && (
        <CreamCard>
          <Markdown>{copy.content}</Markdown>
        </CreamCard>
      )}
    </ColorPage>
  );
}

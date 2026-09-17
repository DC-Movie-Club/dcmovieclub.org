import { getUpcomingEvents } from "@/lib/data";
import { Markdown } from "@/components/Markdown";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import { formatEventMonth } from "@/lib/event-format";
import { FeaturedEventCard } from "@/components/events/FeaturedEventCard";
import { EventTile } from "@/components/events/EventTile";
import { outlinedTextStyle } from "@/components/events/outlined-text";
import type { CalendarEvent } from "@/types/event";

function groupByMonth(events: CalendarEvent[]) {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const label = formatEventMonth(event);
    groups.set(label, [...(groups.get(label) ?? []), event]);
  }
  return [...groups].map(([label, events]) => ({ label, events }));
}

function CreamPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl border-[3px] border-charcoal bg-cream shadow-xl sketch"
      />
      <div className="relative px-6 py-8 sm:px-8">{children}</div>
    </div>
  );
}

export default async function Events() {
  const [events, copy] = await Promise.all([
    getUpcomingEvents(),
    getCopy(copySlots.events.key),
  ]);

  const [featured, ...rest] = events;
  const months = groupByMonth(rest);

  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the teal runs to the bottom edge; pb-36 re-adds that clearance.
    <div className="-mb-24 min-h-screen bg-teal px-6 pt-14 pb-36 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-14">
        <header className="flex flex-col gap-4">
          <h1
            className="text-5xl uppercase leading-none tracking-wide text-cream [--outline-ink:var(--color-charcoal)] sm:text-6xl"
            style={outlinedTextStyle}
          >
            Events
          </h1>
          <p className="text-lg uppercase tracking-wide text-cream/80">
            Screenings, happy hours, and hangouts around DC
          </p>
        </header>

        {featured ? (
          <FeaturedEventCard event={featured} />
        ) : (
          <CreamPanel>
            <p className="text-center text-lg uppercase tracking-wide text-charcoal/80">
              No upcoming events right now. Check back soon!
            </p>
          </CreamPanel>
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
          <CreamPanel>
            <Markdown>{copy.content}</Markdown>
          </CreamPanel>
        )}
      </div>
    </div>
  );
}

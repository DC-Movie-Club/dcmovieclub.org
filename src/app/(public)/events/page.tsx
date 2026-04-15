{/* Upcoming events with a calendar overview and ticket links (Ticket Tailor embeds or links).
    This is the centerpiece of the automation system: eventually, publishing an event here will
    auto-create a Ticket Tailor listing, Google Calendar entry, Discord webhook notification,
    and blog/Substack post.
    Image specs: Ticket Tailor header 2048x652, thumbnail 216x216.
    For now, stub with a placeholder event card layout. */}

function PlaceholderEventCard() {
  return (
    <div className="rounded border border-border p-6">
      <div className="aspect-wide w-full rounded bg-muted" />
      <h3 className="mt-4 text-xl uppercase tracking-wide">Event Title</h3>
      <p className="mt-1 text-sm text-muted-foreground">Date &middot; Time &middot; Venue</p>
      <p className="mt-3 text-muted-foreground">
        Event description placeholder. Will include film details, venue info, and ticket link.
      </p>
      <span className="mt-4 inline-block text-sm uppercase tracking-wide text-primary">
        Get Tickets &rarr;
      </span>
    </div>
  );
}

export default function Events() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl uppercase tracking-wide">Events</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Upcoming screenings and events from DC Movie Club.
      </p>
      <div className="mt-10 flex flex-col gap-8">
        <PlaceholderEventCard />
        <PlaceholderEventCard />
      </div>
    </div>
  );
}

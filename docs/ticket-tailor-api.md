# Ticket Tailor API Notes

API base: `https://api.tickettailor.com`
Auth: HTTP Basic with API key as username, empty password.
Rate limit: 5000 requests / 30 minutes.
Docs: https://developers.tickettailor.com/docs/api/ticket-tailor-api/

## Data model

Every event belongs to an **event series** (even one-off events are a series with one occurrence).

- **Event series** — parent container: name, description, images, venue, ticket types, currency
- **Event occurrence** — specific date/time within a series, inherits most fields from the series

## Images

Read-only on `GET /v1/events/:event_id` and `GET /v1/event_series/:event_series_id`:

```json
"images": {
  "header": "https://d37ecpm5it19bz.cloudfront.net/.../w_1024/...",
  "thumbnail": "https://d37ecpm5it19bz.cloudfront.net/.../w_108/..."
}
```

- Hosted on Cloudfront with Cloudinary-style transform params in the URL (crop, scale, quality)
- Header is ~1024px wide, thumbnail ~108px
- **No write endpoint exists** — images cannot be uploaded or set via the API, only through the dashboard UI
- Dashboard accepts PNG, JPG, JPEG; recommended header size 2048x652

## Extracting event ID from URL

TT event URLs look like: `https://www.tickettailor.com/events/dcmovieclub/2142745`

The trailing number (`2142745`) maps to the event ID used in the API (`ev_2142745` or just the number — needs testing with a real key).

## Implementation plan

1. Add `TICKET_TAILOR_API_KEY` to env
2. For events that have a TT link (already extracted via regex in `src/lib/data.ts`), parse the event ID from the URL
3. Fetch `GET /v1/events/:event_id` to get `images.header` / `images.thumbnail`
4. Add `imageUrl` to the `CalendarEvent` type and pass it through to the events page

## Endpoints reference (write)

None of the write endpoints accept image params:

| Endpoint | Accepts image? |
|---|---|
| POST /v1/event_series (create series) | No |
| POST /v1/event_series/:id (update series) | No |
| POST /v1/event_series/:id/events (create occurrence) | No |
| POST /v1/event_series/:id/events/:id (update occurrence) | No |
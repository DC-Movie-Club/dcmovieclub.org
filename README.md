# dcmovieclub.org

Website for DC Movie Club — a community of film lovers in Washington, DC.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

| Command | Description |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Caching

Production runs on Firebase App Hosting, whose CDN caches any `GET` response marked `public` with `s-maxage`, including requests that carry cookies. `headers()` in `next.config.js` sets:

| Paths | `Cache-Control` | Why |
|---|---|---|
| Everything except `/_next/static/` and `/_next/image` | `public, s-maxage=1, stale-while-revalidate=59` | Changes reach visitors within about a minute. Left alone, Next marks static pages `s-maxage=31536000`, and the CDN would keep them for up to a year |
| `/admin/*`, `/api/*` | `private, no-store` | Responses depend on the admin session cookie, so the CDN must never share them |
| `/_next/static/*` | Next's default | Built files keep their `immutable` header. In dev their filenames don't change with their contents, so a cacheable header leaves browsers on stale CSS/JS |
| `/_next/image` | Next's default | Optimized images keep Next's long cache lifetime, so the CDN doesn't send every image request back to the optimizer |

These headers override Next's own per-route `Cache-Control`, so check a new rule with `next build && next start` rather than trusting the docs.

Server-side freshness:

- **Editable copy** (`getCopy`) reads Firestore on every request via `connection()`, so edits need no revalidation
- **Calendar events, Letterboxd reviews and Substack posts** are fetched with `revalidate: 3600`, so they can lag by up to an hour

Files in `public/` get the short `public` header without `max-age`, so browsers may hold an old copy for a while after one changes. Rename the file when replacing an image.

## Stack

- [Next.js 16](https://nextjs.org/docs) — App Router, Turbopack
- [React 19](https://react.dev/reference/react)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [Firebase](https://firebase.google.com/docs) — Auth, Firestore, Storage, Hosting
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) — Icons
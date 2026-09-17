# DCMC Roadmap

Central planning doc for the DC Movie Club site + automation work. Synthesized from the "Tech help" email thread between Gus, Abbie (founder), and Hannah (designer), Feb–Jun 2026.

Each block below is a discrete project. Check items off as they ship. Status legend: ✅ done · 🟡 in progress · ⬜ not started · ⏳ blocked / waiting on someone.

**The four goals** (Gus's framing, rough priority order):
1. DCMC has a website.
2. DCMC events require minimal touches from Abbie.
3. DCMC depends on processes more than people — anyone can set up an event.
4. DCMC has an online store.

Related technical docs: [restore-stripped-features.md](./restore-stripped-features.md) · [setup-google-cloud-resources.md](./setup-google-cloud-resources.md)

---

## Goal 1 — The Website

### Infrastructure & accounts 🟡
- [x] GitHub org created (`DC-Movie-Club`) + repo `dcmovieclub.org`
- [x] Abbie invited to GitHub org (abbie@dcmovieclub.org)
- [x] Hosting live on Google Cloud App Hosting (~$0–1/mo)
- [x] Coming-soon page parked at `backend--dcmovieclub-61fed.us-east4.hosted.app`
- [ ] Point `dcmovieclub.org` (Squarespace domain) at the App Hosting backend
- [ ] Transition hosting billing from Gus's card → DCMC card (Abbie to reimburse; Gus tracking expenses)
- [ ] Transition prototype accounts → DCMC-owned accounts at launch

### Design direction 🟡
Locked in from Abbie's May feedback on the first draft:
- [x] First draft built — hand-drawn/sketchy lines, hover wobble, cream background
- [ ] Make sticker effect cleaner — lean into a **layered/scrapbook** feel rather than messy
- [ ] Sidebar nav: **spell out the club name** instead of using the logo mark at the bottom
- [ ] Primary color **navy** (not black — use navy everywhere for a softer feel; black only for layering)
- [ ] Red as the **calendar text** accent; avoid looking too patriotic
- [ ] Hero/banner: artwork of **people repping the club** rather than the DC skyline (DC can show up subtly — hat, tattoo, etc.); based on Hannah's tee design
- [ ] Easter eggs / playground interactions — whimsical but **can't fully wreck the homepage** (inspo: whimsy.joshwcomeau.com, reset/reload fixes everything)

Reference sites: Suns Cinema (simplicity), Music Box Theatre (persistent-logo sidebar nav), thenewbev.com, Oddsorts tactile feel.

### Public pages
Routes scaffolded under `src/app/(public)/`. Most are placeholders pending content + design lock.
- [x] **Home** — first draft, actively iterating
- [ ] **About** ⏳ — waiting on copy/layout ideas from Abbie (resources to get involved, socials, photos)
- [ ] **Contact** — simple
- [ ] **Newsletter** — embed Substack subscribe (easy)
- [ ] **Instagram** (`/instagram`) — link-in-bio flow: posts as clickable links to events/articles; replaces Linktree
- [ ] **Events** — placeholder; build after home-page patterns are nailed; monthly calendar overview + ticket links
- [ ] **Blog** — placeholder; decide Substack→site automation vs. native posts (leaning: automate Substack to site first)
- [ ] **Partnerships** — second tier; existing partners + how to partner (needs dynamic content)

### Admin dashboard 🟡
`src/app/admin/` — where Abbie & Hannah manage the site.
- [x] Scaffolded (content, resources, admins routes; admin users via API route handler)
- [ ] Phone-number sign-in ⏳ — need the phone numbers Abbie & Hannah want to use
- [ ] Create/edit events
- [ ] Manage blog posts
- [ ] Edit page copy
- [ ] Upload photos from past events

---

## Goal 2 — Event Automation

Vision: hitting "publish" on an event in the DCMC admin fans out to every platform. Long-term, **the DCMC site is the source of truth** and other platforms pull from it (currently inverted — site pulls from them).

- [ ] **Ticket Tailor** — chosen ticketing platform (good API, fair price). ⏳ Need API key from Abbie (Box office settings → Manage → API). See [ticket-tailor-api.md](../docs/ticket-tailor-api.md)
- [ ] **Google Calendar** — auto-create events on the shared calendar
- [ ] **Discord** — auto-post event announcements (replaces the manual moderator step)
- [ ] **Substack** — no public write API; stays manual for now
- [ ] **Instagram** — maybe; ~$16/mo via getlate.dev. Deferred
- [ ] Linktree becomes redundant once `/instagram` ships

Current manual workflow being replaced: lock venue → IG post → Ticket Tailor page → Linktree → Google Calendar → Substack email → Discord.

---

## Goal 3 — Processes Over People

- [ ] Runbooks / instruction docs in Google Docs so volunteers can run events
- [ ] Claude Code walkthrough for non-coders (Gus to record) — let Abbie/Hannah make site edits via AI
- [ ] Explore a drag-and-drop tool in the admin to ease graphic resizing/organization

---

## Goal 4 — Online Store

- [ ] Pick an ecommerce provider (Shopify et al. integrate easily in code). Future / not started.

---

## Email Hosting (cross-cutting)

Abbie is on Google Workspace (prohibitively expensive per user; she needs to add org emails as she grows).
- [ ] Migrate Google Workspace → **Zoho** ($1/user/mo, 2 free). Zoho has a migration tool.
- [ ] Diagnose the earlier Zoho spam problem — likely missing **SPF / DKIM / DMARC** DNS records in Squarespace. Set these up this time. (Abbie checking with her partner who originally set it up.)

---

## Design Assets — Hannah

Drive folder delivered with font, logos, colors, illustrations.
- [x] Brand asset folder in Google Drive
- [ ] **Favicon** ⏳ — 512×512 png/svg that still reads clearly at 32×32
- [ ] More stickers — bigger pool to decorate pages
- [ ] Source / max-res / editable files for the newer graphics
- [ ] Identify the body font (the one in the brand materials) for site typography
- [ ] Banner artwork (people repping the club, per design direction above)

---

## Open Questions / Decisions
- Blog: automate Substack → site, or native posts? (Current lean: automate Substack first.)
- Ticketing: Ticket Tailor confirmed over Withfriends (no automation) and Eventbrite (too expensive).

## Meeting log
- **Jun 1, 2026** — In-person coffee (Stoney's). Agenda: Zoho switchover + grab Ticket Tailor API key. _(Update with outcomes.)_
- **Apr 2, 2026** — Google Meet with Hannah added; kicked off design collaboration.
- **Apr 17, 2026** — Gus shared first draft + walkthrough video; requested favicon, stickers, phone numbers, About copy.

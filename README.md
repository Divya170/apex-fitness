# Apex Fitness Club — Website

Full-stack implementation of the six-page Apex Fitness Club website (Napa, CA), built from the approved design canvas.

| Layer    | Tech | Folder |
|----------|------|--------|
| Frontend | Next.js 15 (App Router, React 19, TypeScript) | `frontend/` |
| Backend  | NestJS 10 (REST API, class-validator) | `backend/` |
| Database | SQLite 3 via better-sqlite3 | `database/app.sqlite` |

```
apex-fitness/
├── backend/src/
│   ├── common/        admin guard, validation, rate limiter, generic CRUD, submission helpers
│   ├── database/      SQLite service + typed repository
│   ├── programs/      training programs
│   ├── plans/         membership plans (price only when supplied)
│   ├── schedule/      weekly sessions: day/program filters, per-day summary
│   ├── gallery/       images, categories, featured images
│   ├── site-content/  benefits, facilities, business hours, trainers, testimonials
│   ├── settings/      contact details, club story, privacy link
│   ├── inquiries/     membership inquiries (public submit + admin)
│   ├── contact/       contact messages (public submit + admin)
│   └── admin/         token check, dashboard stats
├── frontend/
│   ├── app/(site)/    Home · Programs · Membership · About · Gallery · Contact
│   ├── app/admin/     content management dashboard
│   ├── components/    header, footer, hero rotator, ticker, schedule board, success card …
│   └── public/art/    equipment graphics (stand-ins for real club photography)
├── database/          schema.sql · seed.sql · app.sqlite (ready to use)
├── scripts/setup-env.js
└── package.json
```

## Quick start

Requires **Node.js 20.12+** (22 LTS recommended).

```bash
npm install          # root helper (concurrently)
npm run setup        # installs backend + frontend, creates .env files, prints your admin token
npm run dev          # API → http://localhost:4000/api · site → http://localhost:3000
```

* Website: <http://localhost:3000>
* Admin: <http://localhost:3000/admin> (token = `ADMIN_TOKEN` in `backend/.env`)
* Health: <http://localhost:4000/api/health>

Production: `npm run build && npm start`. Reset data to the starter content: `npm run db:reset`.

`backend/.env`: `PORT`, `CORS_ORIGIN`, `DATABASE_PATH`, `ADMIN_TOKEN`, `IP_HASH_SALT`.
`frontend/.env.local`: `API_URL`. The browser calls same-origin `/api/*`, and Next.js rewrites it to the API.

## Pages and what's dynamic

| Page | Data from the API | Interactions |
|---|---|---|
| Home | featured gallery images (hero), programs, facilities, schedule, trainers, testimonials, settings | hero crossfade (6.5 s, pause/dots, reduced-motion aware), pausable program ticker, program tiles → program sections, schedule day picker. **Trainers and testimonials sections render only when real records exist.** |
| Programs | programs, schedule | jump chips, alternating program showcases, "Ask about …" → Membership with the program pre-selected, full schedule with day + program filters |
| Membership | plans, benefits, programs | plan cards ("Selected" state) pre-fill the form; `?plan=` / `?program=` deep links; inquiry form → success card with reference |
| About | settings (club story), facilities | facility mosaic, proposed philosophy (flagged as such) |
| Gallery | images, categories, featured | featured crossfade with controls, category filter (served by the API), masonry, lightbox with ←/→, Esc, swipe, focus trap |
| Contact | settings, hours | tel/mailto/directions links, **live Google Maps embed by address search** (no invented coordinates), hours table ("Contact us for current hours" until supplied), contact form → success card |
| Admin | everything | stats; inquiries & messages (search, status filter, status, notes, delete); CRUD for programs, plans, schedule, gallery, benefits, facilities, hours, trainers, testimonials; site details |

Every list has loading, empty and error states. Every form has inline validation, an error summary, loading and double-submit guards, server error mapping and a success card with next-step buttons.

## Business rules (enforced by the API)

* **Pricing:** plans store `price_cents = NULL` until supplied, and the site shows `$[—]`. A priced plan needs a real billing frequency.
* **Schedule:** sessions need valid `HH:MM` times, end after start, and a published program (or none). The site shows "Training schedule coming soon" while the schedule is empty.
* **Trainers / testimonials:** never seeded. A testimonial can't be published (or stay published) without the member's permission.
* **Hours:** empty values are stored as NULL, so the site says "Contact us for current hours" instead of inventing times.
* **Membership inquiries:** valid plan/program (or "not sure yet"), one inquiry per email per 10 minutes (409 with the earlier reference), 5 submissions per visitor per 10 minutes (hashed IP), honeypot spam trap, reference such as `AF-261119-GK44`. Statuses: `new → contacted → joined → closed`.
* **Contact messages:** same protections; reference `AM-…`; statuses `new → replied → closed`.
* Deleting a plan or program keeps past inquiries, with the link set to null and the name kept.

## API (prefix `/api`)

Public: `GET /site` · `GET /programs` · `GET /programs/:slug` · `GET /plans` · `GET /schedule?day=0-6&program=slug` · `GET /schedule/summary` · `GET /gallery?category=` · `GET /gallery/featured` · `GET /gallery/categories` · `GET /benefits` · `GET /facilities` · `GET /hours` · `GET /trainers` · `GET /testimonials` · `POST /membership-inquiries` · `POST /contact` · `GET /health` · `GET /meta`

Admin (`Authorization: Bearer <ADMIN_TOKEN>`): `POST /auth/verify` · `GET /admin/stats` · `GET|PATCH|DELETE /admin/inquiries[/:id]` · `GET|PATCH|DELETE /admin/messages[/:id]` · `GET|POST /admin/{programs|plans|sessions|gallery|benefits|facilities|hours|trainers|testimonials}` · `GET|PATCH|DELETE /admin/{…}/:id` · `PUT /admin/site`

Validation errors return `400 { message, errors: { field: message } }`.

## Content: real vs placeholder

Real: **Apex Fitness Club · 3627 River Avenue, Napa, CA 94559 · +1 (309) 657-6728 · apexfitnessclub@gmail.com**, plus the four confirmed program names.
Everything else is seeded as an editable **[bracketed] placeholder**: program details, plan names, prices and inclusions, benefits, facilities, gallery photos, hours and the club story. The schedule, trainers and testimonials start empty. Replace the equipment graphics with real club photography through Admin → Gallery / Facilities / Programs.

## Integration points

* Email notifications: `InquiriesService.submit` / `ContactService.submit` log each submission. Connect an email provider there.
* Add a privacy-friendly challenge (e.g. Cloudflare Turnstile) if spam appears. Add the privacy-policy URL in Admin → Site details.
* The rate limiter is per-process. Use a shared store if you run several API instances.

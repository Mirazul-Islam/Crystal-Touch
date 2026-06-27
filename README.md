# Crystal Touch — Cleaning Company Web App

A full-stack web app for a cleaning company, built with **React + Vite**, **Netlify
serverless functions**, and **Supabase** (Postgres + Auth + Storage).

It serves three kinds of users:

| Role | What they do |
| --- | --- |
| **Client** (public, no login) | Browse the SEO marketing site and submit a booking request. Track their booking and read the after-service report via a private link. |
| **Admin** | Review incoming requests, send a quote, **dispatch** (assign) a cleaner, update status, manage cleaner accounts, and review reports. |
| **Cleaner** | See jobs assigned to them, upload photos and comments while on the job, and submit a final report when the cleaning is done. |

---

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form + Zod, react-helmet-async.
- **API:** Netlify Functions (TypeScript) — the only place the Supabase service-role key lives.
- **Data / Auth / Storage:** Supabase.

---

## 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project
- (For local function dev) the [Netlify CLI](https://docs.netlify.com/cli/get-started/): `npm i -g netlify-cli`

## 2. Set up Supabase

1. Create a new Supabase project.
2. Open the **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   This creates the tables, enums, row-level-security policies, and the `job-photos`
   storage bucket.
3. From **Project Settings → API**, copy:
   - `Project URL`
   - `anon` `public` key
   - `service_role` secret key

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Where it's used | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | browser | anon public key |
| `VITE_SITE_URL` | browser | base URL for client booking links |
| `SUPABASE_URL` | functions | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | functions | **secret** — server only |
| `SUPABASE_STORAGE_BUCKET` | functions | defaults to `job-photos` |

> On Netlify, set the same variables under **Site settings → Environment variables**.

## 4. Create the first admin

Supabase doesn't ship with an admin, so bootstrap one:

1. In Supabase → **Authentication → Users → Add user**, create a user with an email +
   password (and tick "Auto Confirm User").
2. In the **SQL Editor**, promote that user to admin (a `profiles` row is created
   automatically by a trigger; this updates the role):

   ```sql
   update public.profiles
   set role = 'admin', full_name = 'Your Name'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

After that, the admin can create **cleaner** accounts from the dashboard UI — no SQL needed.

## 5. Run locally

Run the Vite dev server **and** the Netlify functions together so `/api/*` works:

```bash
npm install
netlify dev
```

This serves the app at `http://localhost:8888` with functions on `/api/*`.

> `npm run dev` runs only the frontend (Vite on `:5173`); the booking/admin/cleaner
> features that call `/api/*` need `netlify dev`.

## 6. Build / verify

```bash
npm run build      # type-checks (tsc) and produces the production bundle in dist/
npm run typecheck  # type-check app + functions without building
```

## 7. Deploy to Netlify

1. Push this repo to GitHub and "Import from Git" in Netlify (or `netlify deploy --prod`).
2. `netlify.toml` already wires the build command, publish dir, functions dir, the
   `/api/*` redirect, and the SPA fallback.
3. Add the environment variables from step 3.

---

## End-to-end test (the happy path)

1. Go to `/` and submit a booking request → you land on `/thank-you` with a private
   tracking link `/booking/<token>`.
2. Log in at `/login` as the admin → the request appears in the dispatch board at
   `/admin`. Open it, optionally set a quote, and **assign a cleaner** (create one first
   under "Cleaners").
3. Log in as that cleaner → the job shows under `/cleaner`. Open it, upload a photo,
   add a comment, mark it in progress, then **submit a report**.
4. Open the client's `/booking/<token>` link → status shows **Completed** and the
   report (summary, checklist, before/after photos) is visible.

---

## Project structure

```
.
├── netlify/functions/        # serverless API (service-role key lives here only)
│   ├── _shared/              # supabase service client, auth/role guard, http helpers
│   └── *.ts                  # bookings, job-updates, reports, users, upload-sign
├── public/                   # robots.txt, sitemap.xml, favicon
├── src/
│   ├── components/           # ui kit, layout, ProtectedRoute, Seo
│   ├── context/              # AuthContext (Supabase session + role)
│   ├── features/booking/     # booking form + cleaning-service options config
│   ├── lib/                  # supabase browser client, api fetch wrapper, types
│   └── pages/                # public / auth / admin / cleaner pages
├── supabase/schema.sql       # tables, enums, RLS, storage bucket
└── netlify.toml
```

## SEO notes

The home page is content-rich and semantic, with per-route meta tags
(`react-helmet-async`), JSON-LD `LocalBusiness` structured data, `robots.txt`, and a
`sitemap.xml`. Because this is a single-page app, enable **Netlify's prerendering**
(Site settings → Build & deploy → Prerendering) so crawlers that don't run JS still get
fully rendered HTML. Replace the `crystaltouch.example.com` placeholder domain and the
`og-image.png` with your real values before launch.

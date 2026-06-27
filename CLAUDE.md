# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A website for **Melody for Medicine** — a teen-run group that performs at senior living communities and local events. It's an **Astro 5 app running as a Cloudflare Worker** (`@astrojs/cloudflare` adapter), built to run entirely on the **Cloudflare free plan**. The public site showcases performers and past performances and accepts two kinds of inbound submissions (hosting requests, volunteer applications). A custom `/admin` area manages all content. Node >= 22.

## Cloudflare services used (all free tier)

| Binding | Service | Used for |
|---------|---------|----------|
| `DB` | **D1** (SQLite) | All content + form submissions. Schema in `migrations/`. |
| `MEDIA` | **R2** | Uploaded images (performer headshots, performance covers). |
| `ASSETS` | Workers static assets | Serves the prerendered `./dist`. |
| `TURNSTILE_SITE_KEY` (var) + `TURNSTILE_SECRET_KEY` (secret) | **Turnstile** | Spam protection on public forms. |
| — | **Cloudflare Access** (Zero Trust, free ≤50 users) | Protects `/admin/*` at the edge (see Admin auth below). |

The `@astrojs/cloudflare` adapter logs a `SESSION` KV binding warning on build — harmless; Astro sessions aren't used.

## Commands

```bash
npm run dev        # Astro dev server (localhost:4321). Bindings provided via platformProxy.
                   #   In dev, /admin is OPEN (no Access in front) — see Admin auth.
npm run preview    # astro build && wrangler dev — runs the real Worker with local D1/R2.
npm run build      # Build to ./dist/
npm run check      # astro build && tsc && wrangler deploy --dry-run (closest thing to CI)
npm run deploy     # wrangler deploy
npm run cf-typegen # Regenerate worker-configuration.d.ts after changing wrangler.json bindings

# Local D1 (state lives under .wrangler/, gitignored):
npx wrangler d1 migrations apply melody-db --local      # apply migrations locally
npx wrangler d1 execute melody-db --local --command "SELECT * FROM performers"
```

There is no test runner or linter. After schema or binding changes, run `npm run cf-typegen`. To test admin/forms against the real runtime use `npm run preview` (not `dev`), since `import.meta.env.DEV` is only true under `astro dev`.

## Architecture

- **All dynamic pages and endpoints set `export const prerender = false`** — they read/write D1 at request time. Pages without it are prerendered static. Forget this and a DB-backed page will be baked at build time with stale/empty data.
- **Data layer**: `src/lib/db.ts` owns the row types and all queries. Get the binding via `getDb(Astro.locals)` (reads `Astro.locals.runtime.env.DB`). Don't reach into `runtime.env` for the DB elsewhere.
- **Schema lives in `migrations/`** as numbered SQL files applied by `wrangler d1 migrations apply`. `0001_init.sql` is the schema; `0002_seed.sql` is sample content. Add a new numbered file for any change — never edit an applied migration.
- **Public forms** (`request-performance.astro`, `get-involved.astro`, `contact.astro`) handle their own POST in-page: validate → `verifyTurnstile()` (`src/lib/turnstile.ts`) → insert into D1 → redirect to `/thank-you?type=…`. Note Astro's **CSRF origin check is on by default**, so form POSTs require a matching `Origin` header (browsers send it; raw curl must add `-H "Origin: <host>"`).
- **Upcoming vs. past performances** are split by `event_date` relative to today via `listUpcomingPerformances` / `listPastPerformances` in `db.ts` (used on the home page and `/performances`). Undated performances count as past.
- **CSV export**: `src/pages/admin/export/[type].csv.ts` streams `hosting` / `volunteer` / `contact` submissions as CSV (with a UTF-8 BOM for Excel). It's under `/admin/`, so the same middleware/Access guard applies.
- **Images**: admin uploads go to R2 via `uploadImage()` in `src/lib/admin.ts`, which stores a key like `performers/<ts>-<rand>.jpg`. Only the key is saved in D1. Public pages build URLs with `mediaUrl(key)` (`src/lib/media.ts`), served by the R2 passthrough route `src/pages/media/[...key].ts`. That route **buffers the object and reads metadata via plain properties** — it must NOT call `object.writeHttpMetadata(headers)` or return the streamed `object.body`, because passing a `Headers`/`ReadableStream` across the `astro dev` platformProxy boundary throws "Cannot stringify arbitrary non-POJOs" (works in `wrangler dev`/prod, fails under `astro dev`).
- **Content editing**: performers and performances have create (on the list page, e.g. `admin/performers.astro`) and full **edit** pages (`admin/performers/[id].astro`, `admin/performances/[id].astro`) — a list file and a `[id]` route coexist under the same path. Edits replace/remove images and clean up the old R2 object via `deleteImage()`.
- **Photo galleries**: `performance_photos` (migration `0004`) holds multiple images per performance, managed on the performance edit page and shown on the public detail page. This is separate from the single `cover_key`.
- **iCal feed**: `src/pages/events.ics.ts` emits a `text/calendar` feed of upcoming performances (all-day VEVENTs). Linked as "Add to calendar" on `/performances`. UIDs/URLs use `astro.config.mjs`'s `site`, so set the real domain before relying on it.
- **Admin auth**: `src/middleware.ts` guards `/admin/*`. It allows the request when the `Cf-Access-Authenticated-User-Email` header is present (injected by Cloudflare Access) **or** when running `astro dev`; otherwise 403. There is no app-level login — protection is Cloudflare Access in production. `adminEmail()` surfaces the header for display only.
- **Shared layout/UI**: `src/layouts/Base.astro` (public) and `src/layouts/Admin.astro` (admin). Shared CSS utilities (`.btn`, `.card`, `.grid`, `.field`, `.notice`) live in `src/styles/global.css`; the design system is the Bear-blog CSS-variable palette in `:root`. Nav is data-driven from `NAV_LINKS` in `src/consts.ts`.

## Before deploying (one-time setup)

These can't be done from code — they need the Cloudflare account:

1. `npx wrangler d1 create melody-db` → put the returned `database_id` into `wrangler.json` (currently a placeholder).
2. `npx wrangler r2 bucket create melody-media`.
3. Create a **Turnstile** widget → set the real `TURNSTILE_SITE_KEY` in `wrangler.json` and `npx wrangler secret put TURNSTILE_SECRET_KEY`. (Test keys that always pass are pre-filled for local dev in `.dev.vars` / `wrangler.json`.)
4. Apply migrations to remote: `npx wrangler d1 migrations apply melody-db --remote`.
5. In Cloudflare **Zero Trust → Access**, add a self-hosted application protecting `/admin*` with an email/identity policy. Without this, `/admin` returns 403 in production by design.
6. Set the real domain in `astro.config.mjs` (`site:`), which drives canonical URLs and the sitemap.

Secrets (`TURNSTILE_SECRET_KEY`) live in `.dev.vars` locally (gitignored; see `.dev.vars.example`) and as Wrangler secrets in production.

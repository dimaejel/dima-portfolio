
# Portfolio CMS — Phased Plan

Lovable Cloud is now enabled. I'll build the CMS in phases so the public site keeps working at every step. Each phase ends with a working checkpoint.

## Sections currently in the portfolio
Hero, About, Skills, Projects, Education, Experience, Certifications, Achievements, Contact. No Services or Testimonials sections exist — I will not invent them.

## Phase 1 — Foundations (auth + admin shell)
- DB: `app_role` enum, `user_roles` table, `has_role(uuid, app_role)` SECURITY DEFINER function, `profiles` table auto-populated by `on_auth_user_created` trigger.
- Auth: email/password only. Sign-ups disabled in UI — you become admin via a one-time bootstrap (first user to sign up gets `admin` role via trigger, then bootstrap is disabled), OR I insert your role after you sign up once. I'll go with: first signup gets admin, subsequent signups get no role.
- Routes: `/auth` (public), `/_authenticated/admin/*` gated by managed layout + `has_role('admin')` check in a nested layout. Non-admins are redirected.
- Admin shell: sidebar + header + responsive layout, Overview page placeholder.

## Phase 2 — Content schema + migration
One migration creates all content tables with RLS (public SELECT where visible, admin-only write via `has_role`), GRANTs, timestamps, `display_order`, `visible`:
- `site_profile` (single row: name, title, roles[], bio, email, phone, location, avatar_url, resume_url, social links, stats jsonb, interests[])
- `projects`, `skills` (with `group` category), `experience`, `education`, `certifications`, `achievements` (one row per item with category)
- `contact_messages` (public INSERT, admin SELECT/UPDATE/DELETE)
- Storage bucket `site-media` (public read, admin write)
- Seed migration inserts current values from `src/data/portfolio.ts` so the public site renders identically after switchover.

## Phase 3 — Public site data wiring
Rewire each section component (Hero, About, Skills, Projects, Education, Experience, Certifications, Achievements, Contact) to fetch from Supabase via TanStack Query with the current portfolio.ts values as loading fallback. Visual design, animations, layout, and typography are untouched. Contact form POSTs to `contact_messages`.

## Phase 4 — Admin CRUD pages
One page per content type, all sharing the shell:
- Site Profile (single form + avatar/resume upload)
- Projects (list, create/edit dialog, image upload, feature toggle, publish toggle, drag-reorder)
- Skills (grouped list, inline add/edit, visibility toggle, reorder)
- Experience (list + form, current-position flag, reorder, visibility)
- Education (list + form, reorder, visibility)
- Certifications (list + form, reorder, visibility)
- Achievements (grouped by category, add/edit/delete, reorder, visibility)
- Messages inbox (list newest-first, unread badge, mark read, delete with confirm)

## Phase 5 — Overview dashboard + polish
Real stat cards (counts across all tables + unread messages), loading/empty/error states everywhere, sonner toasts, confirm dialogs for deletes, search on Projects and Messages.

## Deferred / not in scope (as confirmed)
Services, Testimonials, SEO settings page (site meta is already static per-route; can add later if wanted).

## Technical notes
- All admin mutations go through `createServerFn` with `requireSupabaseAuth` middleware + server-side `has_role('admin')` check — UI hiding is never the only guard.
- RLS: public reads only for `visible = true` rows; admin bypass via `has_role`. Writes admin-only.
- Uploads via `supabase.storage` client-side (admin session only), URLs stored in DB.
- No Express, no edge functions, no Node-only deps.

I'll start executing Phase 1 as soon as you approve. If you'd rather I hold sign-ups closed and manually grant you admin after your first signup instead of "first signup wins", say so before I run the auth migration.

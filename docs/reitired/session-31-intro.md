# Session 31 — Quantum Physician Admin

Hi Claude — this is Todd, founder/developer of Quantum Physician. We're on Session 31 of building the QP admin panel and patient platform. I'm uploading our 3 handoff docs (admin-master-plan.md, full-infrastructure-doc.md, fusion-gap-analysis.md) plus reference docs (session-26-crm-plan.md, session-30-email-automation-plan.md, session-system-design.md).

## What happened last session (Session 30)
Built and deployed the TRUE automated email system for 1-on-1 sessions. Netlify cron (`session-cron.js`) runs daily at 8 AM ET, sends day-before reminders, post-session follow-ups, intake nudges, and 72-hour payment expiry notices via a new standalone Google Apps Script (Pipeline #3). Idempotent send logic prevents double-sends. Premium QP-branded templates with dark navy design, Tracey's headshot, and teal/taupe accents. Toggle persistence to database, automation send log viewer, tab/sub-tab persistence on reload. All tested end-to-end — both cron sends and manual admin sends confirmed working.

## Session 31 Priorities
1. **Fix "Create Cycle" crash** — URGENT. Clicking "Create Cycle" on the 1-on-1 Sessions page crashes the admin site. Discovered during a demo.
2. **Regulars / post-session payment flow** — Tracey wants her regular clients to be able to confirm a date without upfront payment (just lock the slot), with a 7-day expiry instead of 72 hours. They pay after the session. Needs a trust flag or client_type field + updated cron expiry logic.
3. **Three.js 3D body model** — Replace 2D body map overlay on progress.html with interactive 3D model using 28 bone-accurate coordinates from Session 28.

## Tech Stack
- Frontend: Vanilla JS, deployed to Netlify from `~/Downloads/quantum-physician`
- Backend: Supabase (PostgreSQL + Auth + Storage), Stripe, Google Apps Script
- Admin: Single-page app at `/admin/` — admin.js (~5966 lines), index.html (~849 lines)
- All server-side ops go through `admin-proxy.js` Netlify function (32 allowed tables)
- 4 isolated email pipelines: Fusion (Apps Script cron), Academy (BulkEmailSender v3), 1-on-1 Sessions (Netlify cron → Apps Script Pipeline #3), QP General (future)

Please read the handoff docs thoroughly before we start building.

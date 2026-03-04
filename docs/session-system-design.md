# 1-on-1 Sessions System — Full Design Spec

**Last updated:** Session 28 (Mar 3, 2026)

## Dr. Tracey's Current Manual Workflow
1. Works in **4-month booking cycles** (e.g., March-June, July-October, Nov-Feb)
2. Blocks out available days (usually Tue/Wed/Thu but varies due to teaching/travel)
3. Takes her **existing recurring clients** and populates them into the new 4-month schedule
4. Sends each client their proposed appointment dates
5. Clients confirm & pay, request changes, or skip months
6. Once existing clients are placed, **remaining open slots become public**
7. Public slots create anticipation — "Next booking window opens [date]"
8. Repeat every 4 months

## Key Design Principles
- Existing clients get priority placement before public booking opens
- 4-month cycles create scarcity/anticipation
- Dr. Tracey controls the schedule, not a free-for-all calendar
- Automation replaces the manual "copy last cycle + adjust" process
- Single session type, one price ($150 for 60 min — set in session_config)
- **All bookings require payment** — recurring and public alike
- **48-hour cancellation policy** (details TBD with Dr. Tracey)
- **72-hour reservation window** for offered/proposed slots — auto-expires if unpaid

---

## BUILD PROGRESS

### ✅ BUILT (Session 23) — Core System
- All 6 database tables created with RLS policies
- Full admin panel Sessions tab (5 sub-tabs)
- Cycle Manager with status pipeline + visual progress bar
- Availability Calendar with bulk actions + import from previous cycle
- Client Roster with CRUD + preferences
- Auto-Populate Engine for recurring clients
- Client Date Assignment with available day picker + custom dates
- Bookings Grid with filters + status management
- Client Quick Email with templates + merge fields
- Public Booking Controls (open/coming_soon/closed toggle)
- Waitlist Manager with offer slot flow
- Offer Slot: date picker → preference matching → email preview → test send → Confirm & Pay CTA
- Frontend: dynamic booking page with 3 states (open/coming_soon/filled)
- Frontend: waitlist signup form with preferred day/time/message
- Frontend: monthly calendar with time slot picker (when open)

### ✅ BUILT (Session 24) — Stripe Payments
- **session-checkout.js** Netlify function — dual mode: token-based + public booking
- **session-webhook.js** Netlify function — handles checkout.session.completed
- Admin: confirmation tokens, Pay Link button, Mark Paid, status badges
- Frontend: ?pay=TOKEN handler, slot selection modal, payment success/cancelled overlays
- Database: confirmation_token column, updated status constraint
- Stripe: webhook endpoint configured, product image

### ✅ BUILT (Session 25) — Member Portal
- Login/signup/reset-password pages
- Member dashboard with sidebar layout + customizable cards
- Settings page (profile, avatar, password, notifications)
- Auth-aware shared header with avatar dropdown
- SVG icon system standardized
- Cross-domain SSO (QP → Fusion token passing)

### ✅ BUILT (Session 26) — Patient Portal Pages
- 4 patient pages: sessions.html, intake.html, progress.html, billing.html
- My Health sidebar section in dashboard
- 5 new database tables: session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes
- RLS policies for all patient tables

### ✅ BUILT (Session 27) — CRM + Progress Enhancements
- Cross-domain SSO fixed (Cloudflare truncation root cause)
- Admin CRM: Client Profiles with 5-tab detail view
- Progress page: collapsible charts, symptom/energy charts, before/after toggle, quick stats, body map, milestone markers
- Demo data: 4 bookings, 4 notes, 2 recordings, intake form, 12 monthly check-ins, 3 progress notes

### ✅ BUILT (Session 28) — Notes, Recordings, Body Regions
- **28 bone-accurate body regions** extracted from GLB skeleton inverse bind matrices
- **Admin region picker modal**: 28 tappable chips + custom alignment input with nearest-region dropdown
- **Session notes full CRUD**: add/edit/delete, body regions, YES/NO visibility toggle
- **Multiple notes per session**: collapsible in bookings grid with emoji indicators
- **Recording upload system**: drag & drop MP4 to Supabase Storage OR paste URL (Vimeo/GDrive/YouTube/Zoom)
- **Smart video embeds on patient side**: auto-detects source → HTML5 player / Vimeo iframe / GDrive iframe / YouTube iframe / external link
- **Deep linking**: `?highlight=bookingId` on sessions.html opens Past tab, expands card, scrolls
- **Real-time refresh**: `refreshBookingsView()` replaces all scattered reloads
- **Green "✓ Complete" button** on paid bookings
- **Recording indicators**: `📝 2 notes · 🎥 1 recording` in collapsible toggle row
- **Bug fix**: session_recordings uses `uploaded_at` NOT `created_at` (was causing 400 errors)

### ⬜ NOT YET BUILT
- CRM merge into Clients tab (remove standalone page-crm)
- Email automation (reminders, follow-ups, invoicing)
- End-to-end Stripe payment test
- Three.js 3D body model on progress.html (replacing 2D overlay)
- 72-hour offer expiry automation
- 48-hour cancellation enforcement
- Add-to-calendar (.ics) generation
- QP-branded premium email template for sessions

### ⬜ FUTURE
- Analytics dashboard (utilization, retention, revenue)
- Post-session follow-up automation
- Cycle summary report to Tracey
- Multi-currency invoicing (CAD+HST, EUR)
- Memberships / Subscriptions

---

## DATABASE TABLES

### Core Session Tables (6 — Session 23-24)

| Table | Key Columns |
|-------|-------------|
| `session_config` | session_price ($150), session_duration_minutes (60), booking_buffer_minutes, public_booking_status, timezone, zoom_link |
| `session_cycles` | name, start_date, end_date, status (planning/client_confirm/public_open/active/complete) |
| `session_availability` | cycle_id, date, start_time, end_time, status (available/booked/blocked), visibility (recurring/public/both) |
| `session_clients` | email, name, frequency, preferred_day, preferred_time, priority, status (active/paused/inactive) |
| `session_bookings` | cycle_id, client_id, email, name, date, start_time, end_time, status, type (recurring/public), stripe_payment_id, confirmation_token |
| `session_waitlist` | email, name, preferred_days (jsonb), preferred_times (jsonb), message, status (pending/notified/booked/expired) |

### Patient CRM Tables (5 — Session 26+28)

| Table | Key Columns |
|-------|-------------|
| `session_notes` | booking_id, note_type (session/followup/internal), content, body_regions (jsonb), visible_to_patient (bool), created_at |
| `session_recordings` | booking_id, recording_url, title, duration_minutes, **uploaded_at** (⚠️ not created_at), source_type (external/supabase), file_path, file_size_mb |
| `patient_intake` | user_id, 30+ fields, symptoms (jsonb), created_at, updated_at |
| `patient_checkins` | user_id, check_in_date, symptoms (jsonb), energy (int), sleep (int), notes, created_at |
| `patient_progress_notes` | user_id, note_type (alignment/milestone/observation), content, created_at |

### Supabase Storage
| Bucket | Purpose |
|--------|---------|
| `session-recordings` | MP4 uploads from admin. Public read, auth write/delete. Files: `{booking_id}/{timestamp}.{ext}`. 50MB max per file. |

---

## Booking Status Flow

```
proposed → paid → completed
                → cancelled (48-hour policy)
                → no_show
proposed → declined (slot freed)
proposed → expired (72 hours passed without payment)
```

No separate "confirmed" state — confirm & pay is one atomic step via Stripe checkout.

---

## Admin Bookings Grid (Session 28)

### Per-Booking Row
- Date, time, client email/name, type badge, status badge
- **Actions by status:**
  - Proposed: Pay Link, Mark Paid, Decline, + Note
  - Paid: ✓ Complete (green), No Show, Cancel (red), + Note, + Recording
  - Completed: + Note, + Recording
  - Confirmed: + Note

### Collapsible Notes/Recordings Row
- Toggle: `▸ 📝 2 notes · 🎥 1 recording click to expand`
- **Note rows** (teal bg): type badge, visibility badge, content, body region pills, time ago, Edit/Toggle/Delete buttons
- **Recording rows** (green bg): 🎥 RECORDING, Hosted/External badge, title, size, time ago, Play link, Delete button

### + Note Modal
- Content textarea
- 28 region chips (multi-select)
- Custom region input + nearest standard region dropdown + "+ Add"
- YES/NO visibility toggle with helper text
- Save / Cancel

### + Recording Modal
- Two tabs: Upload File | Paste URL
- Upload: drag & drop zone, file info, progress bar
- Paste: text input for any video URL
- Title field
- Save / Cancel

### refreshBookingsView()
All actions call this one function: parallel fetch of bookings + notes + recordings, then re-render grid + stats. Eliminates need for hard refresh.

---

## Patient Sessions Page (Session 28)

### Smart Video Embed Detection
```javascript
function renderRecording(r) {
  // Supabase hosted → HTML5 <video> player + download
  // Vimeo → embedded player (title=0&byline=0&portrait=0)
  // Google Drive → embedded preview player
  // YouTube → embedded player
  // Fallback → "Opens in new tab" link
}
```

### Deep Linking
`sessions.html?highlight={bookingId}` → auto-switches to Past tab → finds card by data-booking-id → expands details → highlights with teal border → smooth scrolls

### Notes Display
- Only shows `visible_to_patient = true` notes
- Body region badges (teal pills) under each note
- Region names with hyphens replaced by spaces

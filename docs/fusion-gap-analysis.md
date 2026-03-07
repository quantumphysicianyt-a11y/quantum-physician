# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

**Last updated:** Session 39 (Mar 7, 2026)

---

## 🎉 FUSION PARITY STATUS: COMPLETE ✅ (since Session 11)
All features from Fusion admin are now in QP admin. Zero gaps remain.

---

## QP Admin — Beyond Parity Features (Sessions 1–35)

### Email Center ✅
- Rich HTML email builder, 11 card templates, CTA Button Library
- Campaign history with per-recipient tracking, unified rich editor

### Course Builder ✅
- Full course builder with lesson creation, quiz builder, student tools

### Admin & Security ✅
- Supabase-based admin login with roles + 12 permission flags
- Admin-proxy server-side pattern (33 allowed tables + RPC)
- Auth token auto-refresh (3-layer system)

### 1-on-1 Sessions System ✅
- Cycle Manager, Availability Calendar, Client Roster (sort dropdown), Bookings Grid (sortable headers, Payment column, Active/Completed/Cancelled/All tabs)
- Offer Slot flow, Stripe checkout + payment webhook
- Reschedule system, bulk actions, reactivate button
- Regulars flow (client_type, auto-confirm, payment request emails)

### Invoice System ✅ (Session 33)
- Auto-generate on payment, QP-branded PDF, admin Invoices sub-tab, patient billing page
- Bulk generate per cycle, sortable grid, instant PDF preview

### Email Automation ✅ (Sessions 29-32)
- 5 toggles, Netlify cron 8 AM ET, idempotent, automation log viewer, Next Cron Run Preview

### Cancellation Policy ✅ (Session 35)
- 24hr no-refund window enforced
- Client cancel button in member portal with policy warning modal
- QP-branded cancellation emails (refund + no-refund variants)
- Admin acknowledge flow for client-initiated cancellations

### Calendar Invites ✅ (Session 35)
- Google Calendar, Apple Calendar, Outlook buttons in confirmation email
- `generate-ics.js` function with 24hr + 1hr reminders

### Session Types & Multi-Currency ✅ (Session 36)
- `session_types` table: Zoom Session (€200, 30min), Recorded Session (€150, 30min)
- Admin CRUD in new Session Types tab
- Per-booking price snapshot (session_type_id, amount_cents, currency)
- Per-client currency override (EUR default, CAD+HST for Canadians)

### Dual Offer Flow ✅ (Session 36)
- Regular clients: confirm date (7 days), payment via day-before reminder
- Public clients: confirm & pay via Stripe (72hr expiry)
- ★ Regular badge consistent across all admin views

### Day-Before Cron Upgrade ✅ (Session 36)
- Health update request ("share updates and goals") in all reminders
- Session-type-aware (duration, type name, zoom detection)
- Soft payment nudge for unpaid regulars

### Cycle Automation Engine ✅ (Session 37)
- 6-stage progress bar: Planning → Client Confirm → Waitlist (48hr) → Public Open → Active → Complete
- Stage-driven batch emails on each "Advance →" click
- Locked advance with live countdown timer during confirmation window
- Cron auto-advance: waitlist 48hr expiry, cycle end date
- Regress-safe advance with resend/skip option

### Confirm Token Flow ✅ (Session 37)
- `?confirm=TOKEN` regular client flow — confirms date without payment
- `?pay=TOKEN` public client flow — multi-currency Stripe checkout (EUR/CAD/USD)
- Branded confirmation/error overlay pages

### Premium Sessions Page ✅ (Session 38)
- Floating orb CTA (homepage-matching 120px orb, pulse ring, stage-aware label)
- Calendar popup modal with premium animations (glow, shimmer, border pulse, staggered fadeUp)
- Inline animated booking card replacing old full-page calendar
- Waitlist modal (replaces inline form, duplicate email prevention)
- Autofill dark-theme CSS fix
- Future-slot check syncs inline + modal (no open/filled mismatch)

### Bookings Grid Redesign ✅ (Session 38)
- Primary action + "⋯" overflow menu per row
- `withSpinner()` loading spinner on primary actions
- Add Note available for all statuses

### Member Portal ✅ (Session 25+)
- Login/signup/reset-password, dashboard, settings, sessions, intake, progress, billing
- SVG icon system, cross-domain SSO (QP→Fusion)

### Patient CRM ✅ (Sessions 26-29)
- 6-tab client profile (Sessions, Intake, Progress, Billing, Notes, Emails)
- Session notes, recordings, progress charts, 3D body model (28 bone-accurate regions)

---

## QP Member Portal vs Fusion Member Experience

| Feature | Fusion | QP |
|---------|--------|-----|
| Login/Signup | ✅ | ✅ |
| Dashboard | ✅ Retro neon | ✅ Navy/teal sidebar |
| Profile/Avatar | ✅ Basic | ✅ Full settings + avatar upload |
| Password Change | ❌ | ✅ |
| Notification Prefs | ❌ | ✅ |
| Session History | ✅ Basic | ✅ Full + recordings |
| Session Recordings | ❌ | ✅ Inline video player |
| Cancel Session | ❌ | ✅ With 24hr policy warning |
| Calendar Invites | ❌ | ✅ Google + Apple + Outlook |
| Health Intake | ❌ | ✅ 5-section questionnaire |
| Progress Tracking | ❌ | ✅ Charts, milestones, 3D body map |
| Billing / Invoices | ❌ | ✅ Invoices + purchase history |
| Community Forum | ✅ Full | ✅ Card links to Fusion |
| Auth-Aware Header | ❌ | ✅ All QP pages via shared.js |

---

## Planned Features (Not Yet Built)

### Needs Tracey's Input
- ⬜ Pre/post session patient forms — token-based URLs, mobile-first, 30-60 sec, feeds progress charts
- ⬜ Invoice defaults: payment terms (7 days? due on receipt?), HST for Canadian clients, auto-send preference

### Near-Term
- ✅ Sessions page floating CTA + calendar popup modal (Session 38)
- ✅ Bookings grid action bar redesign (primary + overflow) (Session 38)
- ✅ Waitlist as modal (Session 38)
- ✅ **CONFIRM_WINDOW_MS → 7 days** (Session 39)
- ✅ Loading spinners on all admin button actions (Session 39 — 63 buttons wrapped)
- ⬜ Availability calendar click-to-expand + drag-and-drop
- ⬜ Client roster currency/tax editor (mark Canadian clients)
- ⬜ 24hr reschedule enforcement in admin (block reschedule within 24hrs)
- ⬜ Regular reschedule request flow (auto-reschedule if slot available)
- ⬜ Confirmation email tone update per Tracey
- ⬜ Invoice currency from booking (webhook still hardcoded)
- ⬜ Multiple preferred times per client (better auto-populate for larger rosters)

### Future
- ⬜ Student tools: flashcards, highlighting, reflection journal, summarizer
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing / documentation / transcription
- ⬜ Memberships / Subscriptions
- ⬜ Live Event Page
- ⬜ SMS reminders
- ⬜ In-app secure messaging
- ⬜ Patient satisfaction surveys
- ⬜ Consent forms / HIPAA agreements
- ⬜ Multi-instructor support

---

## Email Pipeline Architecture (4 pipelines — NEVER cross-contaminate)
| # | Pipeline | Template Style | Trigger | Log Table | Status |
|---|----------|---------------|---------|-----------|--------|
| 1 | Fusion Sessions | Purple/neon gradient | Apps Script cron | `scheduled_emails` + `email_log` | ✅ Live |
| 2 | Academy/Marketing | Custom HTML | Manual from admin | `email_campaigns` + `email_tracking` | ✅ Live |
| 3 | 1-on-1 Sessions | QP teal/taupe, Georgia serif | Netlify cron → Apps Script | `email_automation_log` | ✅ Live |
| 4 | QP General | QP branded | Transactional | TBD | ⬜ Future |

---

## Database Tables Summary (32 + admin_users + auth.users)

### Session System (7)
session_config, session_cycles, session_availability, session_clients (+client_type, +currency, +tax_label, +tax_rate), session_bookings (+session_type_id, +amount_cents, +currency, +stripe_session_id, +client_cancelled, +admin_acknowledged, +cancellation_reason, +cancelled_at, +payment_requested_at, +rescheduled_from, +reschedule_reason), session_waitlist, session_types (NEW Session 36)

### Patient CRM (5)
session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes

### Invoices (1 — Session 33)
invoices (+invoice_number_seq sequence, +generate_invoice_number() function)

### Automation & Config (2 — Session 30)
email_automation_log, system_config

### Existing (17 + admin_users)
purchases, referral_codes, profiles, credit_history, notification_preferences, qa_enrollments, qa_courses, qa_lessons, qa_modules, qa_lesson_progress, admin_notes, discussion_posts, qa_discussions, email_campaigns, email_tracking, email_log, promotions, scheduled_emails, session_schedule

### Supabase Storage Buckets (7)
avatars (public), session-recordings (public), invoices (private), course-videos (private), course-files (private), course-thumbnails (public), achievements (public)

---

## Cross-Domain Integration Status
- SSO QP → Fusion: ✅ WORKING (token passing via URL hash)
- SSO Fusion → QP: ⬜ Not yet implemented
- Shared Supabase project: ✅ Same project (rihlrfiqokqrlmzjjyxj)
- Shared Stripe account: ✅ Same account
- Cross-site credit sharing: ✅ Via referral system
- Unified admin panel: ✅ QP admin manages both platforms

# Fusion Admin → QP Unified Admin: Feature Gap Analysis

## ⚠️ CRITICAL STRATEGIC DECISION (DO NOT LOSE)
**The QP unified admin will REPLACE the Fusion admin entirely.**
- Build QP admin first with full feature parity → then retire Fusion admin
- Do NOT modify the Fusion admin while building — it stays live and untouched
- Once QP admin covers everything, fusionsessions.com/admin.html gets decommissioned
- One admin panel at qp-homepage.netlify.app/admin/ manages both platforms

**Last updated:** Session 22 + Hotfixes (Feb 28, 2026) — Session 23 (1-on-1 Sessions) starting next

---

## 🎉 FUSION PARITY STATUS: COMPLETE ✅ (since Session 11)
All features from Fusion admin are now in QP admin. Zero gaps remain.

---

## QP Admin — Beyond Parity Features

### Email Center (Sessions 4-6, 8, 11, 19-20)
- ✅ Rich HTML email builder with Fusion + Academy brand templates
- ✅ Tracking pixels + click tracking
- ✅ Discount cards, QR codes in emails
- ✅ Multi-card emails with unlimited cards, drag-reorder pills
- ✅ Card Library — 11 pre-built templates (referral, community, session, testimonial, bold CTA, academy promo, QR, purchase confirmation, getting started, session product, bundle)
- ✅ CTA Button Library — Watch Sessions, Go to Dashboard, Referral Hub, Explore Academy, Join Community, Custom CTA
- ✅ Smart CTA detection — extracts button text/URL from markdown links, keyword fallback
- ✅ Live auto-preview with 800ms debounce
- ✅ Cursor-position merge tag insert
- ✅ Discount auto-strip (prevents duplicates)
- ✅ Session image token rendering (`{{session_image:session-XX}}`)
- ✅ **Rich Text Editor** (SESSION 20) — Full WYSIWYG with font/size/color/heading/alignment/lists/links/emoji/image/table/blockquote/indent/line-spacing/source-toggle
- ✅ **Test Email** (SESSION 20) — Themed modal, sends via Apps Script
- ✅ **Auth Auto-Refresh** (SESSION 20) — onAuthStateChange + 45-min interval + 401 retry

### Unified Rich Editor (Session 22) ✅
- ✅ `createRichEditor(config)` reusable component with instance-based state
- ✅ Mounted in Email Center (inline), SG popup, and Recovery popup
- ✅ Selection save/restore fixes CTA focus-loss bug
- ✅ Syncing guard prevents infinite input loops

### Course Builder (Sessions 14-18)
- ✅ Full course builder with lesson creation, ordering, management
- ✅ Quiz builder with multiple question types
- ✅ Full-page lesson viewer with progress bars, tip boxes, images, key takeaways
- ✅ Light/dark mode, theme toggle
- ✅ Student notes panel, print notes
- ✅ Interactive checkboxes, focus timer with Pomodoro presets
- ✅ Demo course generator

### Admin & Security (Sessions 9, 12)
- ✅ Supabase-based admin login with roles (super_admin, admin, assistant)
- ✅ 12 granular permission flags per admin
- ✅ Admin-proxy server-side pattern (55+ operations)
- ✅ Security headers on both repos
- ✅ Service key rotation, client-side key removed
- ✅ Webhook Recovery Tool with deduplication

### Other
- ✅ Unified Referral Hub (auto-themed Fusion/Academy)
- ✅ Weekly Marketing Goals widget
- ✅ Downloadable CSV reports (6 types)
- ✅ Custom Analytics Query

---

## Planned Features (Not Yet Built)

### Session 23 — 1-on-1 Sessions System (STARTING IMMEDIATELY)
- ⬜ 4-month booking cycle engine (Dr. Tracey's manual workflow → automated)
- ⬜ Admin: Cycle Manager, Availability Builder (calendar), Auto-Populate Engine, Client Roster, Booking Grid, Confirmation Tracker, Public Booking Controls, Waitlist Manager
- ⬜ Frontend: Session info page, dynamic booking status banner (open/closed/countdown), available slots calendar, Stripe checkout, client confirmation portal (tokenized), waitlist signup
- ⬜ 6 new database tables: session_config, session_cycles, session_availability, session_clients, session_bookings, session_waitlist
- ⬜ Automation: confirmation emails, 24hr/1hr reminders, waitlist notifications, cycle opening alerts
- ⬜ Full design spec: `docs/session-system-design.md`

### Session 24 — Live Event Page
- ⬜ Branded live Zoom experience page (pre/during/post states)
- ⬜ Countdown timer, embedded Zoom (Web SDK), live reactions
- ⬜ Session replay (Vimeo), product cards, referral widget
- ⬜ Access control: free (email gate), paid (login+purchase), upsell, teaser
- ⬜ Swappable layout templates (Classic/Immersive/Minimal)
- ⬜ Admin config section for live events

### Future
- ⬜ Student tools: flashcards, highlighting, reflection journal, summarizer, progress dashboard, goal tracking
- ⬜ Custom card templates (save your own)
- ⬜ AI Copilot for email writing
- ⬜ Memberships / Subscriptions
- ⬜ Multi-instructor support

---

## Database Tables (17 tables + admin_users + auth.users)

### Read by QP Admin
| Table | Purpose |
|-------|---------|
| `purchases` | All transactions |
| `referral_codes` | Referral system |
| `profiles` | User profiles + community_role |
| `credit_history` | Credit audit trail |
| `qa_enrollments` | Academy enrollments |
| `qa_courses` | Course catalog |
| `qa_lesson_progress` | Lesson completion |
| `admin_notes` | Admin notes per customer |
| `discussion_posts` | Fusion community posts |
| `qa_discussions` | Academy discussions |
| `email_campaigns` | Sent campaign history |
| `email_tracking` | Per-recipient tracking |
| `promotions` | Promo codes and discounts |
| `scheduled_emails` | Automated email queue |
| `email_log` | Individual email send records |
| `session_schedule` | Fusion session dates and Zoom info |
| `admin_users` | Admin accounts + permissions |
| `auth.users` (Admin API) | Email verification, last login, opt-in |

### Written by QP Admin
| Table | Operations |
|-------|------------|
| `admin_audit_log` | INSERT |
| `admin_notes` | INSERT, DELETE |
| `referral_codes` | INSERT, UPDATE |
| `purchases` | INSERT, UPDATE, DELETE |
| `profiles` | UPDATE |
| `qa_enrollments` | INSERT, UPDATE |
| `qa_lesson_progress` | DELETE |
| `email_campaigns` | INSERT, UPDATE |
| `email_tracking` | INSERT |
| `promotions` | INSERT, UPDATE, DELETE |
| `scheduled_emails` | UPDATE |
| `admin_users` | SELECT, INSERT, UPDATE |

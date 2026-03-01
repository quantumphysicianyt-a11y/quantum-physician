# 1-on-1 Sessions System — Full Design Spec

## Dr. Tracey's Current Manual Workflow
1. Works in **4-month booking cycles** (e.g., March-June, July-October, Nov-Feb)
2. Blocks out available days (usually Tue/Wed/Thu but varies due to teaching/travel)
3. Takes her **existing recurring clients** and populates them into the new 4-month schedule
4. Sends each client their proposed appointment dates
5. Clients confirm, request changes, or skip months
6. Once existing clients are placed, **remaining open slots become public**
7. Public slots create anticipation — "Next booking window opens [date]"
8. Repeat every 4 months

## Key Design Principles
- Existing clients get priority placement before public booking opens
- 4-month cycles create scarcity/anticipation
- Dr. Tracey controls the schedule, not a free-for-all calendar
- Automation replaces the manual "copy last cycle + adjust" process
- Single session type, one price

---

## DATABASE TABLES NEEDED

### `session_config` — Global settings
- id, cycle_months (default 4), session_duration_minutes, session_price, 
- timezone, booking_buffer_minutes (gap between sessions)
- current_cycle_start, current_cycle_end
- public_booking_opens_at (when open slots become bookable)
- public_booking_status: 'closed' | 'open' | 'coming_soon'
- waitlist_enabled (boolean)
- confirmation_deadline_days (how long clients have to confirm)

### `session_availability` — Dr. Tracey's available time blocks
- id, date, start_time, end_time, cycle_id
- status: 'available' | 'blocked' | 'teaching' | 'travel' | 'personal'
- notes (optional - "Teaching BodyTalk Access in Toronto")
- created_at

### `session_cycles` — Each 4-month booking cycle
- id, name (e.g., "Spring 2026"), start_date, end_date
- status: 'planning' | 'client_confirmation' | 'public_open' | 'active' | 'completed'
- client_confirmation_sent_at
- client_confirmation_deadline
- public_opens_at
- notes
- created_at

### `session_clients` — Recurring client roster
- id, email, name, profile_id (FK to profiles)
- frequency: 'weekly' | 'biweekly' | 'monthly' | 'every_2_months'
- preferred_day: 'monday' | 'tuesday' | ... 
- preferred_time (e.g., "10:00")
- status: 'active' | 'paused' | 'waitlist' | 'inactive'
- priority (for placement order)
- notes
- started_at, created_at

### `session_bookings` — Individual appointments
- id, cycle_id, client_id (nullable for public bookings)
- email, name
- date, start_time, end_time
- status: 'proposed' | 'confirmed' | 'declined' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
- type: 'recurring' | 'public' | 'manual'
- stripe_payment_id (for public paid bookings)
- zoom_link
- notes
- reminder_sent_at
- confirmation_token (for email confirm/decline links)
- proposed_at, confirmed_at, cancelled_at
- created_at

### `session_waitlist` — People waiting for openings
- id, email, name, profile_id
- preferred_days (json array), preferred_times (json array)
- message (optional note from person)
- status: 'waiting' | 'notified' | 'booked' | 'expired'
- notified_at, created_at

---

## ADMIN PANEL FEATURES

### 1. Cycle Manager (Top-Level View)
- See current cycle status with visual progress bar
- "New Cycle" wizard: pick start/end dates, auto-suggests next 4 months
- Cycle status pipeline: Planning → Client Confirmation → Public Open → Active → Completed
- One-click advance to next phase

### 2. Availability Builder (Calendar View)
- Monthly calendar grid showing the 4-month cycle
- Click days to toggle: Available / Blocked / Teaching / Travel
- Bulk actions: "Mark all Tuesdays available", "Block week of March 10-14"
- Set time slots per day (e.g., 9am-12pm, 2pm-5pm)
- Import from previous cycle as starting template
- Visual indicators: green=available, red=blocked, orange=teaching, blue=travel

### 3. Auto-Populate Engine
- "Populate from Current Clients" button
- Algorithm: For each active client, find their preferred day/time across the cycle
  - If preferred slot is available → propose it
  - If not (blocked day) → find nearest available alternative
  - If frequency is monthly → pick one slot per month
  - If biweekly → pick every other week
- Preview before committing: shows proposed schedule with conflicts highlighted
- Manual drag-and-drop adjustments before sending
- "Send Confirmations" button → emails all clients their proposed dates

### 4. Client Roster Manager
- List of all recurring clients with frequency, preferred day/time, status
- Add/edit/remove clients
- Quick stats: "12 active, 3 paused, 5 on waitlist"
- Click client → see their booking history across cycles
- "Pause" client (skip next cycle) vs "Deactivate" (remove from auto-populate)
- Import from existing profiles/purchases

### 5. Booking Grid (Day/Week View)
- Visual timeline showing all bookings for a day or week
- Color-coded: proposed (yellow), confirmed (green), declined (red), public (purple)
- Click slot to: view details, edit, reschedule, cancel, mark complete
- Drag to reschedule
- Empty slots clearly visible as "Open for public" or "Unassigned"

### 6. Client Communication Dashboard
- Batch email: send all proposed appointments in one click
- Per-client email: individual scheduling messages
- Confirmation tracker: who confirmed, who hasn't responded, who declined
- Auto-reminder: "You haven't confirmed your April appointments yet"
- Decline handler: show what the client wants (skip, reschedule, pause)

### 7. Public Booking Controls
- Toggle: "Open public booking" / "Close public booking"
- Set the "opens at" date for the countdown
- See available slots that will be public
- Manually reserve/hold slots before opening
- View public bookings as they come in

### 8. Waitlist Manager
- View all people on waitlist
- When a slot opens (cancellation/decline), auto-notify best-match waitlisters
- Priority queue based on signup date
- One-click "Offer this slot to [person]"

### 9. Analytics & Reports
- Utilization rate: % of available slots filled
- Client retention: who renewed vs paused/left
- Revenue per cycle
- Most popular days/times
- Cancellation/no-show rate
- Waitlist conversion rate

### 10. Reminders & Automation
- Auto-send appointment reminders (24hr, 1hr before)
- Auto-send confirmation request emails with confirm/decline links
- Auto-send "cycle opening soon" notification to waitlist
- Auto-mark no-shows after appointment time passes
- Auto-generate Zoom links per booking (or use one standing link)

---

## FRONTEND (PUBLIC-FACING) FEATURES

### 1. Session Info Page (pages/one-on-sessions.html)
- Beautiful branded page explaining Dr. Tracey's 1-on-1 sessions
- What to expect, session format, duration, price
- Dr. Tracey photo/bio snippet
- Testimonials section
- H.O.P.E. methodology tie-in

### 2. Booking Status Banner
- Dynamic state based on cycle:
  - "Currently Booking" → show available slots + book button
  - "Fully Booked" → show waitlist signup
  - "Next Booking Opens [Date]" → countdown timer + waitlist signup
- Creates the anticipation/scarcity Dr. Tracey described

### 3. Available Slots Grid (when public booking is open)
- Calendar showing available dates
- Click date → see available time slots
- Select slot → checkout flow
- Stripe payment integration
- Confirmation email with Zoom link

### 4. Waitlist Signup (when fully booked)
- Name, email, preferred days/times
- Optional message
- "We'll notify you when the next cycle opens"
- Confirmation email

### 5. Client Confirmation Portal (for existing clients)
- Unique link sent via email (token-based, no login required)
- Shows all proposed appointments for the cycle
- Per-appointment: Confirm ✓ | Decline ✗ | Request Change
- "Request Change" → shows alternative available slots nearby
- Bulk confirm all button
- Summary at bottom: "3 confirmed, 1 declined, 1 pending"

### 6. My Appointments (for logged-in users)
- If user has session bookings, show upcoming appointments
- Past appointment history
- Cancel/reschedule options (within policy window)
- Add to calendar button (Google/Apple/Outlook .ics)

---

## AUTOMATION SEQUENCES

### Cycle Setup Flow
1. Admin creates new cycle → sets dates
2. Admin builds availability (calendar blocks)
3. Admin clicks "Auto-Populate" → algorithm places recurring clients
4. Admin reviews/adjusts → clicks "Send Confirmations"
5. Clients receive emails with confirm/decline links
6. Deadline passes → declined/unconfirmed slots freed up
7. Admin clicks "Open Public Booking" (or auto-opens on set date)
8. Public books remaining slots
9. Cycle goes "Active" on start date

### Email Sequences
- **Client Confirmation**: "Hi {{name}}, your next 4 months of sessions are ready! [View & Confirm]"
- **Confirmation Reminder**: "Reminder: Please confirm your sessions by [date]"
- **Booking Confirmed**: "Your session on [date] at [time] is confirmed! Here's your Zoom link."
- **24hr Reminder**: "Your session with Dr. Tracey is tomorrow at [time]"
- **1hr Reminder**: "Your session starts in 1 hour. Join here: [Zoom link]"
- **Post-Session Follow-up**: "Thank you for your session! [Feedback / Rebook]"
- **Waitlist Notification**: "Great news! Slots just opened for [cycle]. Book now!"
- **Public Opening**: "The [Spring 2026] booking window is now open!"
- **Cycle Summary** (to Tracey): "Cycle populated: 45/52 slots filled, 7 open for public"


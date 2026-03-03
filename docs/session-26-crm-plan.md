# Session 26 Build Plan — Patient Portal & CRM

## Overview

Build the patient-facing portal pages and matching admin CRM panel for the 1-on-1 Sessions system. The member dashboard sidebar gets a collapsible "My Health" section with 4 sub-pages. The admin panel gets a matching "Client Profiles" view.

---

## Sidebar Navigation Update

Current sidebar:
```
Dashboard (active)
Book a Session
Academy
Fusion Sessions
Account Settings
─────────
Main Site
```

Updated sidebar with collapsible "My Health" section:
```
Dashboard
─── My Health ──────
  Sessions & Recordings
  Intake Form
  Progress Tracker
  Billing History
────────────────────
Book a Session
Academy
Fusion Sessions
Account Settings
─────────
Main Site
```

The "My Health" section appears as a subtle group label with indented sub-items. Uses the same SVG icon style as other nav items. Collapsible on mobile. Active state highlights the current sub-page.

---

## Page 1: Sessions & Recordings (`/members/sessions.html`)

### Purpose
Complete 1-on-1 session history — upcoming, past, notes, and recordings.

### Layout
- Same sidebar layout as dashboard
- Main content: tabbed view (Upcoming | Past | All)

### Features

**Upcoming Sessions:**
- Date badge, time, status pill (Paid/Proposed/Confirmed)
- "Confirm & Pay" button for proposed sessions
- Zoom link (if provided) with "Join" button
- Countdown indicator ("in 3 days")

**Past Sessions:**
- Date, time, duration
- Session notes (shared by Dr. Tracey from admin) — expandable
- Session recording link (Zoom recording URL) — play button
- Status: Completed / No-Show / Cancelled

**Empty State:**
"No sessions yet. Book your first session with Dr. Tracey."

### Database Tables Used
- `session_bookings` — all booking data
- `session_notes` (NEW) — per-session notes from Tracey
- `session_recordings` (NEW) — Zoom recording URLs per booking

### New Tables Needed

```sql
CREATE TABLE session_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES session_bookings(id),
    note_type text DEFAULT 'session', -- 'session', 'followup', 'internal'
    content text NOT NULL,
    visible_to_patient boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE session_recordings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES session_bookings(id),
    recording_url text NOT NULL,
    title text,
    duration_minutes integer,
    uploaded_at timestamptz DEFAULT now()
);
```

---

## Page 2: Intake Form (`/members/intake.html`)

### Purpose
Pre-first-session health questionnaire. Submitted once, editable anytime, visible to Tracey in admin.

### Layout
- Same sidebar layout
- Clean form with sections
- Progress indicator at top showing completion status

### Form Sections

**1. Personal Information**
- Full name (pre-filled from profile)
- Date of birth
- Phone number
- Emergency contact (name + phone)

**2. Health History**
- Current medical conditions (multi-select checkboxes + "Other" text)
- Current medications (text area)
- Allergies (text area)
- Previous surgeries or hospitalizations (text area)
- Family health history (text area)

**3. Current Symptoms & Concerns**
- Primary reason for seeking treatment (text area)
- Current symptoms checklist (pain, fatigue, sleep issues, anxiety, digestive, headaches, etc.)
- Symptom severity scale (1-10 slider for each checked symptom)
- How long have you experienced these symptoms? (dropdown)
- What treatments have you tried? (text area)

**4. Lifestyle & Wellness**
- Exercise frequency (dropdown)
- Diet description (dropdown + text)
- Sleep quality (1-10)
- Stress level (1-10)
- Wellness goals (text area)

**5. Consent & Acknowledgment**
- Checkbox: "I understand this is for wellness purposes, not a substitute for medical care"
- Checkbox: "I consent to Dr. Tracey Clark accessing this information"
- Digital signature (typed name + date)

### Features
- Auto-save as draft on each section
- "Submit" button at end
- Status badge in sidebar: "Not Started" / "In Progress" / "Completed"
- Edit mode after submission (with "Update" button)
- Timestamp showing when submitted/last updated

### Database Table

```sql
CREATE TABLE patient_intake (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) UNIQUE,
    email text NOT NULL,
    status text DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    
    -- Personal
    date_of_birth date,
    phone text,
    emergency_contact_name text,
    emergency_contact_phone text,
    
    -- Health History
    medical_conditions jsonb DEFAULT '[]',
    medications text,
    allergies text,
    surgeries text,
    family_history text,
    
    -- Current Symptoms
    primary_concern text,
    symptoms jsonb DEFAULT '[]', -- [{name, severity}]
    symptom_duration text,
    previous_treatments text,
    
    -- Lifestyle
    exercise_frequency text,
    diet_description text,
    sleep_quality integer,
    stress_level integer,
    wellness_goals text,
    
    -- Consent
    consent_wellness boolean DEFAULT false,
    consent_access boolean DEFAULT false,
    signature_name text,
    signature_date date,
    
    submitted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

---

## Page 3: Progress Tracker (`/members/progress.html`)

### Purpose
Visual health journey — alignment tracking, symptom logging, progress notes from Tracey, trend charts.

### Layout
- Same sidebar layout
- Main content: overview cards at top, chart below, log entries

### Features

**Overview Cards (top row):**
- Total sessions completed
- Days since first session
- Average symptom improvement (% change)
- Next session countdown

**Symptom Tracking Chart:**
- Line chart (Recharts or Chart.js via CDN)
- X-axis: dates, Y-axis: severity (1-10)
- Multiple lines for tracked symptoms
- Toggle symptoms on/off
- Time range filter (1mo, 3mo, 6mo, All)

**Check-In Log:**
- Self-reported entries (patient can add new ones)
- "Add Check-In" button → modal with:
  - Date (defaults to today)
  - Symptoms + severity sliders
  - Notes (how are you feeling?)
  - Energy level (1-10)
  - Sleep quality (1-10)
- Entries shown as timeline cards

**Alignment Notes (from Tracey):**
- Read-only cards showing Tracey's alignment/progress notes
- Date, type (alignment, observation, milestone), content
- Badge for milestones

### Database Tables

```sql
CREATE TABLE patient_checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    email text NOT NULL,
    checkin_date date DEFAULT CURRENT_DATE,
    symptoms jsonb DEFAULT '[]', -- [{name, severity}]
    notes text,
    energy_level integer,
    sleep_quality integer,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE patient_progress_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    email text NOT NULL,
    note_type text DEFAULT 'observation', -- 'alignment', 'observation', 'milestone'
    content text NOT NULL,
    created_by uuid REFERENCES auth.users(id), -- Tracey
    created_at timestamptz DEFAULT now()
);
```

---

## Page 4: Billing History (`/members/billing.html`)

### Purpose
Complete payment history across all QP products — sessions, Academy, Fusion.

### Layout
- Same sidebar layout
- Main content: summary cards + transaction table

### Features

**Summary Cards:**
- Total spent (all time)
- Referral credits available
- Referral credits used

**Transaction Table:**
- Date, description, amount, status, receipt link
- Filterable by type (Sessions, Academy, Fusion, All)
- Sortable by date
- Each row has a "View Receipt" link → opens Stripe receipt URL

**Data Source:**
- `purchases` table (existing) — has email, product, amount, stripe_session_id
- Stripe receipt URLs can be constructed from session IDs
- Referral credit info from `referral_codes` + `credit_history`

### No New Tables Needed
Uses existing: `purchases`, `referral_codes`, `credit_history`

---

## Admin CRM Side (Session 26+)

### Client Profiles Tab in Admin Panel

**Client List View:**
- Table of all 1-on-1 session clients
- Columns: Name, Email, Sessions (count), Intake Status, Last Session, Next Session
- Search + filter
- Click row → Client Detail View

**Client Detail View (expanded profile):**
- Header: Name, email, avatar, member since, total sessions
- Tabs:
  1. **Sessions** — All bookings, add notes, upload recordings
  2. **Intake Form** — Read-only view of patient's intake, flag incomplete
  3. **Progress** — Add alignment notes, view patient check-ins, add milestones
  4. **Billing** — Payment history for this client
  5. **Notes** — Internal notes (not visible to patient)

### Admin Actions:
- Add session notes (per booking, toggle patient visibility)
- Upload recording URL (per booking)
- Add progress notes (alignment, observation, milestone)
- View intake form responses
- Mark intake as "reviewed"
- Send reminder emails (prompt patient to complete intake, check in, etc.)

---

## File Structure After Build

```
members/
├── dashboard.html        ← Updated sidebar with "My Health" section
├── login.html            ← Existing
├── reset-password.html   ← Existing
├── settings.html         ← Existing
├── sessions.html         ← NEW — Session history + recordings + notes
├── intake.html           ← NEW — Health intake form
├── progress.html         ← NEW — Progress tracker + charts
└── billing.html          ← NEW — Payment history
```

---

## Database Migration Script (Run in Supabase SQL Editor)

```sql
-- Session Notes
CREATE TABLE IF NOT EXISTS session_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES session_bookings(id),
    note_type text DEFAULT 'session',
    content text NOT NULL,
    visible_to_patient boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Session Recordings
CREATE TABLE IF NOT EXISTS session_recordings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES session_bookings(id),
    recording_url text NOT NULL,
    title text,
    duration_minutes integer,
    uploaded_at timestamptz DEFAULT now()
);

-- Patient Intake
CREATE TABLE IF NOT EXISTS patient_intake (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) UNIQUE,
    email text NOT NULL,
    status text DEFAULT 'not_started',
    date_of_birth date,
    phone text,
    emergency_contact_name text,
    emergency_contact_phone text,
    medical_conditions jsonb DEFAULT '[]',
    medications text,
    allergies text,
    surgeries text,
    family_history text,
    primary_concern text,
    symptoms jsonb DEFAULT '[]',
    symptom_duration text,
    previous_treatments text,
    exercise_frequency text,
    diet_description text,
    sleep_quality integer,
    stress_level integer,
    wellness_goals text,
    consent_wellness boolean DEFAULT false,
    consent_access boolean DEFAULT false,
    signature_name text,
    signature_date date,
    submitted_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Patient Check-Ins
CREATE TABLE IF NOT EXISTS patient_checkins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    email text NOT NULL,
    checkin_date date DEFAULT CURRENT_DATE,
    symptoms jsonb DEFAULT '[]',
    notes text,
    energy_level integer,
    sleep_quality integer,
    created_at timestamptz DEFAULT now()
);

-- Patient Progress Notes (from Tracey)
CREATE TABLE IF NOT EXISTS patient_progress_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    email text NOT NULL,
    note_type text DEFAULT 'observation',
    content text NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_progress_notes ENABLE ROW LEVEL SECURITY;

-- Patients can read their own notes (visible ones)
CREATE POLICY "Patients read own visible notes" ON session_notes
    FOR SELECT USING (
        visible_to_patient = true AND
        booking_id IN (
            SELECT id FROM session_bookings WHERE email = (
                SELECT email FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Patients can read their own recordings
CREATE POLICY "Patients read own recordings" ON session_recordings
    FOR SELECT USING (
        booking_id IN (
            SELECT id FROM session_bookings WHERE email = (
                SELECT email FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Patients can CRUD their own intake
CREATE POLICY "Patients manage own intake" ON patient_intake
    FOR ALL USING (user_id = auth.uid());

-- Patients can CRUD their own check-ins
CREATE POLICY "Patients manage own checkins" ON patient_checkins
    FOR ALL USING (user_id = auth.uid());

-- Patients can read progress notes about them
CREATE POLICY "Patients read own progress notes" ON patient_progress_notes
    FOR SELECT USING (user_id = auth.uid() OR email = (
        SELECT email FROM profiles WHERE id = auth.uid()
    ));
```

---

## Pre-Session 26 Checklist

Before starting the build, Todd should:

1. **Run the SQL migration** above in Supabase SQL Editor
2. **Verify tables created** — check Table Editor for all 5 new tables
3. **Upload latest handoff docs** — master-plan, fusion-gap, infrastructure (updated with Session 25 changes)
4. **Upload current files** — admin/index.html, admin/admin.js, admin/admin.css, members/dashboard.html

---

## Design Notes

- All pages use the same sidebar layout as the dashboard
- Same QP color palette: navy (#0e1a30), teal (#5ba8b2), gold (#c9a96e)
- Same SVG sprite icon system
- Same Playfair Display headings, Lato body text
- Charts use Chart.js via CDN (lightweight, matches aesthetic)
- Mobile: sidebar collapses, floating hamburger button
- All pages auth-gated (redirect to login if no session)

---

## Handoff Doc Reminders for Session 25

Items to add to the 3 handoff docs:

### master-plan.md
- Session 25: Member portal built (login, dashboard, settings, reset-password)
- Auth-aware shared header with avatar dropdown (shared.js)
- Customizable 3-card dashboard grid
- Sidebar layout matching Academy
- Cross-domain SSO tokens for Fusion links
- SVG sprite icon system (no emojis) — document this as standard
- Patient Portal CRM planned for Session 26

### infrastructure.md
- New files: members/login.html, dashboard.html, settings.html, reset-password.html
- Updated: js/shared.js (auth header), components/header.html (login links)
- Avatar storage: Supabase `avatars` bucket (public, existing)
- Dashboard card preferences: localStorage key `qp_dash_cards`
- Referral lookup: by email (not user_id) in referral_codes table
- 5 new tables planned (session_notes, session_recordings, patient_intake, patient_checkins, patient_progress_notes)

### fusion-gap.md
- Member portal: QP now has feature parity with Fusion's account.html
- QP adds: intake forms, progress tracking, billing history (Fusion doesn't have these)
- Cross-domain SSO: implemented QP→Fusion token passing, Fusion side needs SSO snippet added

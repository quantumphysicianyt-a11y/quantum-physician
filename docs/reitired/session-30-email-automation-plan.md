# Session 30 Build Plan — Automated Email System for 1-on-1 Sessions

**Priority: NON-NEGOTIABLE**
**Goal: Zero manual clicking. Emails send themselves.**
**Status: ✅ COMPLETE — Built, deployed, and tested end-to-end (Mar 4, 2026)**

### Deployment Notes (discovered during testing)
- Admin manual sends route through **BulkEmailSender v3** (not Pipeline #3) with `isHtml: true` and `Content-Type: text/plain`
- Apps Script must be **New Deployment** (not just save) to activate `doPost` code
- Use the **Web app URL** (ending in `/exec`), not the Deployment ID, for `SESSION_EMAIL_SCRIPT_URL` env var
- Premium QP-branded templates rebuilt to match Academy/Fusion quality (dark navy, Tracey headshot, gradient accents)
- Toggle flash fixed by removing default `checked` attributes from HTML
- Tab + sub-tab persistence added via `sessionStorage`
- Send buttons always visible regardless of toggle state (toggles only control cron auto-send)

---

## Architecture Overview

### The Problem
Session 29 built the UI for email automation (toggle cards, preview, manual send buttons), but everything requires manual clicks. The toggles aren't persisted. Nothing is truly automated.

### The Solution
A **self-contained 1-on-1 email pipeline** that runs independently from Fusion and Academy email systems:

```
Daily at 8 AM ET:
  Netlify Scheduled Function (session-cron.js)
    → Queries Supabase for actionable bookings
    → Checks email_automation_log for already-sent (idempotent)
    → Checks system_config for enabled automations
    → Builds QP-branded HTML template
    → POSTs to Google Apps Script
    → Logs result to email_automation_log
```

---

## Database Changes

### Table 1: `email_automation_log`
```sql
CREATE TABLE email_automation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES session_bookings(id),
  email text NOT NULL,
  automation_type text NOT NULL, -- 'day_before', 'follow_up', 'intake_nudge', 'payment_expiry_48h', 'payment_expiry_72h'
  status text DEFAULT 'sent', -- 'sent', 'failed', 'skipped'
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Unique constraint prevents double-sends
CREATE UNIQUE INDEX idx_automation_log_unique 
  ON email_automation_log(booking_id, automation_type);

-- RLS: admin proxy only
ALTER TABLE email_automation_log ENABLE ROW LEVEL SECURITY;
```

### Table 2: `system_config`
```sql
CREATE TABLE system_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

-- Seed with automation defaults
INSERT INTO system_config (key, value) VALUES
  ('auto_day_before', '{"enabled": true}'::jsonb),
  ('auto_follow_up', '{"enabled": true}'::jsonb),
  ('auto_intake_nudge', '{"enabled": false}'::jsonb),
  ('auto_payment_expiry', '{"enabled": false}'::jsonb);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
```

### Admin Proxy Update
Add both tables to `ALLOWED_TABLES` in `admin-proxy.js` (total: 32 tables).

---

## Netlify Scheduled Function: `session-cron.js`

### Location
`netlify/functions/session-cron.js`

### Trigger
```toml
# Add to netlify.toml
[functions."session-cron"]
  schedule = "0 13 * * *"  # 8 AM ET (13:00 UTC)
```

### Logic (pseudocode)
```
1. Read system_config → check which automations are enabled
2. For each enabled automation:

   DAY-BEFORE REMINDER:
   - Query session_bookings WHERE date = tomorrow AND status = 'paid'
   - For each booking:
     - Check email_automation_log for existing 'day_before' + booking_id
     - If not found → build template → send via Apps Script → log

   POST-SESSION FOLLOW-UP:
   - Query session_bookings WHERE status = 'completed' AND date = yesterday
   - For each booking:
     - Check log for existing 'follow_up' + booking_id
     - If not found → build template → send → log

   INTAKE NUDGE:
   - Query session_bookings WHERE status = 'paid' AND date >= today
   - For each booking:
     - Check patient_intake for email → if no intake form submitted
     - Check log for existing 'intake_nudge' + booking_id
     - If not found → build template → send → log

   72-HOUR PAYMENT EXPIRY:
   - Query session_bookings WHERE status = 'proposed' AND created_at < (now - 48h)
   - For bookings 48-72h old → send warning email (if not already sent)
   - For bookings >72h old → update status to 'expired' + send expiry notice
```

### Email Delivery
- Uses Google Apps Script `APPS_SCRIPT_URL` (same as existing system)
- Sends `isHtml: true` with pre-built QP-branded HTML
- No `mode:'no-cors'` limitation since it's server-side (can read response)

### Idempotency
The UNIQUE INDEX on `(booking_id, automation_type)` means:
- If the cron runs twice, the second INSERT fails silently
- No duplicate emails ever
- Safe to retry on failure

---

## Google Apps Script Changes

### Option A: Extend BulkEmailSender v3
Add a new code path in `doPost()`:
```javascript
if (data.pipeline === 'session-1on1') {
  // Use QP-branded template instead of Fusion/neon template
  // FROM: tracey@quantumphysician.com
  // Template: teal/taupe, Georgia serif, lotus logo
}
```

### Option B: New Script (Cleaner)
Separate Apps Script specifically for 1-on-1 session emails. Own deployment URL. Complete isolation.

**Recommendation: Option B** — matches the "self-contained pipeline" architecture.

---

## Admin UI Changes

### Toggle Persistence
The 4 toggle cards currently use `checked` attributes that reset on reload. Wire them to `system_config`:

```javascript
// On page load:
async function loadAutomationConfig() {
  var res = await proxyFrom('system_config').select('*');
  var config = {};
  (res.data || []).forEach(r => config[r.key] = r.value);
  document.getElementById('auto-reminder-day').checked = config.auto_day_before?.enabled ?? true;
  // ... etc
}

// On toggle change:
async function toggleAutomation(key, checkbox) {
  await proxyFrom('system_config').update({ value: { enabled: checkbox.checked } }).eq('key', key);
  showToast('Automation ' + (checkbox.checked ? 'enabled' : 'disabled'), 'success');
}
```

### Automation Log Viewer
Add a section below the reminders list showing recent automation sends:
- Table: timestamp, recipient, type, status
- Filterable by type and status
- Shows last 50 entries

---

## QP-Branded Email Templates

Already built in Session 29 (`buildSessionReminderHtml` in admin.js). The cron function will use the same template structure:

- **Day-Before**: Gradient appointment card with date/time, Zoom link, prep tips, portal deep link
- **Follow-Up**: Thank you message, post-session guidance, progress tracker link
- **Intake Nudge**: Portal link to /members/intake.html, explanation of why intake matters
- **Payment Expiry Warning (48h)**: "Your session slot is reserved for 24 more hours" + pay link
- **Payment Expiry Notice (72h)**: "Your booking has expired" + re-book link

All templates use: Georgia serif, teal/taupe palette, QP lotus logo, pill CTAs.

---

## Testing Plan

1. **Deploy SQL migration** → verify tables created
2. **Deploy admin-proxy update** → verify system_config and email_automation_log accessible
3. **Wire toggles** → verify persist across page reload
4. **Deploy cron function** → trigger manually first via Netlify dashboard
5. **Create test booking for tomorrow** → verify day-before email arrives
6. **Mark a booking as completed** → verify follow-up email arrives next day
7. **Check email_automation_log** → verify entries logged, no duplicates

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `netlify/functions/session-cron.js` | NEW — scheduled function |
| `netlify/functions/admin-proxy.js` | UPDATE — add 2 tables to allowlist |
| `netlify.toml` | UPDATE — add cron schedule |
| `admin/admin.js` | UPDATE — wire toggles to system_config, add log viewer |
| `admin/index.html` | UPDATE — add onchange handlers to toggles |
| Google Apps Script | NEW — 1-on-1 session email script |
| Supabase SQL | NEW — 2 tables + indexes + RLS |

---

## Upload Checklist for Session 30

Todd should upload:
1. `admin/index.html`
2. `admin/admin.js`
3. `admin/admin.css`
4. `netlify/functions/admin-proxy.js`
5. `netlify.toml`
6. `docs/admin-master-plan.md`
7. `docs/full-infrastructure-doc.md`
8. `docs/fusion-gap-analysis.md`
9. Both Google Apps Script files (for reference)

Then run the SQL migration before building begins.

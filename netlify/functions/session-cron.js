// /netlify/functions/session-cron.js
// Runs daily at 8 AM ET (13:00 UTC) via Netlify scheduled function
// Self-contained pipeline #3: 1-on-1 session emails only
// Completely isolated from Fusion and Academy email systems

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  console.log("[session-cron] Starting automated email scan:", new Date().toISOString());

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const SESSION_EMAIL_SCRIPT_URL = process.env.SESSION_EMAIL_SCRIPT_URL;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("[session-cron] Missing Supabase env vars");
    return { statusCode: 500, body: JSON.stringify({ error: "Missing env vars" }) };
  }

  if (!SESSION_EMAIL_SCRIPT_URL) {
    console.error("[session-cron] Missing SESSION_EMAIL_SCRIPT_URL — cannot send emails");
    return { statusCode: 500, body: JSON.stringify({ error: "Missing SESSION_EMAIL_SCRIPT_URL" }) };
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const results = { day_before: 0, follow_up: 0, intake_nudge: 0, payment_expiry_48h: 0, payment_expiry_72h: 0, errors: 0 };

  try {
    // 1. Load automation config
    const { data: configRows } = await sb.from("system_config").select("*");
    const config = {};
    (configRows || []).forEach(r => { config[r.key] = r.value; });

    // 2. Load session config for Zoom link
    const { data: sessConfig } = await sb.from("session_config").select("*").limit(1).single();
    const zoomLink = sessConfig?.zoom_link || "https://zoom.us/j/your-meeting-id";

    // Date calculations (ET timezone — use UTC offset)
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const h72ago = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

    // =============================================
    // DAY-BEFORE REMINDERS
    // =============================================
    if (config.auto_day_before?.enabled) {
      console.log("[session-cron] Processing day-before reminders for:", tomorrowStr);
      const { data: tomorrowBookings } = await sb
        .from("session_bookings")
        .select("*")
        .eq("date", tomorrowStr)
        .eq("status", "paid");

      for (const b of (tomorrowBookings || [])) {
        if (await alreadySent(sb, b.id, "day_before")) continue;
        try {
          const html = buildDayBeforeEmail(b, zoomLink);
          await sendEmail(SESSION_EMAIL_SCRIPT_URL, {
            to: b.email,
            subject: "Your Session Tomorrow with Dr. Tracey Clark",
            html: html
          });
          await logSend(sb, b.id, b.email, "day_before", "sent");
          results.day_before++;
          console.log("[session-cron] Day-before sent to:", b.email);
        } catch (e) {
          await logSend(sb, b.id, b.email, "day_before", "failed", e.message);
          results.errors++;
          console.error("[session-cron] Day-before error:", b.email, e.message);
        }
      }
    }

    // =============================================
    // POST-SESSION FOLLOW-UP
    // =============================================
    if (config.auto_follow_up?.enabled) {
      console.log("[session-cron] Processing follow-up emails for:", yesterdayStr);
      const { data: completedBookings } = await sb
        .from("session_bookings")
        .select("*")
        .eq("status", "completed")
        .eq("date", yesterdayStr);

      for (const b of (completedBookings || [])) {
        if (await alreadySent(sb, b.id, "follow_up")) continue;
        try {
          const html = buildFollowUpEmail(b);
          await sendEmail(SESSION_EMAIL_SCRIPT_URL, {
            to: b.email,
            subject: "Thank You — Session Follow-Up from Dr. Tracey",
            html: html
          });
          await logSend(sb, b.id, b.email, "follow_up", "sent");
          results.follow_up++;
          console.log("[session-cron] Follow-up sent to:", b.email);
        } catch (e) {
          await logSend(sb, b.id, b.email, "follow_up", "failed", e.message);
          results.errors++;
          console.error("[session-cron] Follow-up error:", b.email, e.message);
        }
      }
    }

    // =============================================
    // INTAKE FORM NUDGE
    // =============================================
    if (config.auto_intake_nudge?.enabled) {
      console.log("[session-cron] Processing intake nudges");
      // Find paid bookings for upcoming dates where patient has no intake form
      const { data: upcomingPaid } = await sb
        .from("session_bookings")
        .select("*")
        .eq("status", "paid")
        .gte("date", todayStr);

      for (const b of (upcomingPaid || [])) {
        if (await alreadySent(sb, b.id, "intake_nudge")) continue;
        // Check if patient has submitted an intake form
        const { data: intake } = await sb
          .from("patient_intake")
          .select("id")
          .eq("email", b.email)
          .limit(1);
        
        // Also check by user_id if we can find it
        let hasIntake = intake && intake.length > 0;
        if (!hasIntake) {
          const { data: intakeByUser } = await sb
            .from("patient_intake")
            .select("id")
            .eq("user_id", b.client_id)
            .limit(1);
          hasIntake = intakeByUser && intakeByUser.length > 0;
        }

        if (hasIntake) {
          await logSend(sb, b.id, b.email, "intake_nudge", "skipped", "Intake already submitted");
          continue;
        }

        try {
          const html = buildIntakeNudgeEmail(b);
          await sendEmail(SESSION_EMAIL_SCRIPT_URL, {
            to: b.email,
            subject: "Please Complete Your Intake Form — Quantum Physician",
            html: html
          });
          await logSend(sb, b.id, b.email, "intake_nudge", "sent");
          results.intake_nudge++;
          console.log("[session-cron] Intake nudge sent to:", b.email);
        } catch (e) {
          await logSend(sb, b.id, b.email, "intake_nudge", "failed", e.message);
          results.errors++;
        }
      }
    }

    // =============================================
    // 72-HOUR PAYMENT EXPIRY
    // =============================================
    if (config.auto_payment_expiry?.enabled) {
      console.log("[session-cron] Processing payment expiry");

      // 48h warning: proposed bookings created 48-72h ago
      const { data: warn48 } = await sb
        .from("session_bookings")
        .select("*")
        .eq("status", "proposed")
        .lt("created_at", h48ago)
        .gte("created_at", h72ago);

      for (const b of (warn48 || [])) {
        if (await alreadySent(sb, b.id, "payment_expiry_48h")) continue;
        try {
          const html = buildExpiryWarningEmail(b);
          await sendEmail(SESSION_EMAIL_SCRIPT_URL, {
            to: b.email,
            subject: "Your Session Booking Expires Soon — Please Pay to Confirm",
            html: html
          });
          await logSend(sb, b.id, b.email, "payment_expiry_48h", "sent");
          results.payment_expiry_48h++;
          console.log("[session-cron] 48h expiry warning sent to:", b.email);
        } catch (e) {
          await logSend(sb, b.id, b.email, "payment_expiry_48h", "failed", e.message);
          results.errors++;
        }
      }

      // 72h expired: proposed bookings older than 72h → auto-expire + notify
      const { data: expired72 } = await sb
        .from("session_bookings")
        .select("*")
        .eq("status", "proposed")
        .lt("created_at", h72ago);

      for (const b of (expired72 || [])) {
        if (await alreadySent(sb, b.id, "payment_expiry_72h")) continue;
        try {
          // Update booking status to expired
          await sb.from("session_bookings").update({ status: "expired" }).eq("id", b.id);

          // Free up the availability slot
          if (b.date) {
            await sb.from("session_availability")
              .update({ status: "available" })
              .eq("date", b.date)
              .eq("start_time", b.start_time)
              .eq("status", "booked");
          }

          const html = buildExpiryNoticeEmail(b);
          await sendEmail(SESSION_EMAIL_SCRIPT_URL, {
            to: b.email,
            subject: "Booking Expired — Quantum Physician",
            html: html
          });
          await logSend(sb, b.id, b.email, "payment_expiry_72h", "sent");
          results.payment_expiry_72h++;
          console.log("[session-cron] 72h expired + notified:", b.email);
        } catch (e) {
          await logSend(sb, b.id, b.email, "payment_expiry_72h", "failed", e.message);
          results.errors++;
        }
      }
    }

    console.log("[session-cron] Complete:", JSON.stringify(results));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, results, timestamp: new Date().toISOString() })
    };

  } catch (err) {
    console.error("[session-cron] Fatal error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// =============================================
// HELPERS
// =============================================

async function alreadySent(sb, bookingId, automationType) {
  const { data } = await sb
    .from("email_automation_log")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("automation_type", automationType)
    .eq("status", "sent")
    .limit(1);
  return data && data.length > 0;
}

async function logSend(sb, bookingId, email, automationType, status, errorMessage) {
  try {
    await sb.from("email_automation_log").insert({
      booking_id: bookingId,
      email: email,
      automation_type: automationType,
      status: status,
      error_message: errorMessage || null
    });
  } catch (e) {
    // If it's a duplicate key error (already logged), that's fine — idempotent
    if (e.message && e.message.indexOf("duplicate") !== -1) {
      console.log("[session-cron] Already logged:", automationType, bookingId);
    } else {
      console.error("[session-cron] Log error:", e.message);
    }
  }
}

async function sendEmail(scriptUrl, { to, subject, html }) {
  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "sendSessionEmail",
      to: to,
      subject: subject,
      htmlBody: html,
      fromAlias: "tracey@quantumphysician.com"
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error("Apps Script error " + res.status + ": " + text);
  }

  return res;
}

// =============================================
// EMAIL TEMPLATES — QP-branded (teal/taupe, Georgia serif, lotus logo)
// Identical structure to admin.js buildSessionReminderHtml
// =============================================

function esc(s) { return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function fmtTime(t) {
  if (!t) return "TBD";
  var parts = t.split(":");
  var h = parseInt(parts[0]), m = parts[1] || "00";
  var ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return h + ":" + m + " " + ampm;
}

function wrapTemplate(titleText, subtitleText, innerContent, footerLinkUrl, footerLinkText) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:20px;font-family:Georgia,\'Times New Roman\',serif;background-color:#f4f1ec">'
    + '<div style="max-width:600px;margin:0 auto;background-color:#0e1a30;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.3)">'
    // Header banner
    + '<div style="background:linear-gradient(135deg,#0e1a30,#12283e 50%,#1a3a4a);padding:40px 30px;text-align:center;border-bottom:2px solid rgba(91,168,178,.3)">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/qp-logo.png" alt="Quantum Physician" style="max-width:180px;height:auto;margin:0 auto 24px;display:block">'
    + '<h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#5ba8b2;margin:0 0 8px;letter-spacing:1px">' + titleText + '</h1>'
    + '<p style="color:rgba(255,255,255,.7);font-size:15px;margin:0;font-style:italic">' + subtitleText + '</p>'
    + '</div>'
    // Content area
    + '<div style="padding:40px 30px;color:rgba(255,255,255,.85)">'
    + innerContent
    // Signature
    + '<div style="margin-top:32px;padding:28px;border-top:1px solid rgba(91,168,178,.15);text-align:center">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/tracey-about-me.png" alt="Dr. Tracey Clark" style="width:90px;height:90px;border-radius:50%;border:2px solid rgba(91,168,178,.3);object-fit:cover;display:block;margin:0 auto 16px">'
    + '<p style="margin:0;color:rgba(255,255,255,.7);font-size:14px">With care,</p>'
    + '<p style="margin:6px 0 0;font-weight:700;font-size:18px;color:#5ba8b2;font-family:Georgia,serif">Dr. Tracey Clark</p>'
    + '<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.4)">Quantum Physician | BodyTalk Practitioner</p>'
    + '</div></div>'
    // Footer
    + '<div style="background-color:#081420;padding:24px 20px;text-align:center;color:rgba(255,255,255,.35);font-size:12px;border-top:1px solid rgba(91,168,178,.1)">'
    + '<p style="margin:6px 0"><strong>Quantum Physician</strong></p>'
    + '<p style="margin:6px 0">&copy; 2026 Quantum Physician. All rights reserved.</p>'
    + '<p style="margin:10px 0"><a href="' + (footerLinkUrl || 'https://qp-homepage.netlify.app/members/dashboard.html') + '" style="color:#5ba8b2;text-decoration:none;font-size:11px">' + (footerLinkText || 'Patient Portal') + '</a></p>'
    + '</div></div></body></html>';
}

function fmtDate(dateStr) {
  return new Date(dateStr + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function buildDayBeforeEmail(booking, zoomLink) {
  var name = esc(booking.name || booking.email.split("@")[0]);
  var date = esc(fmtDate(booking.date));
  var time = esc(fmtTime(booking.start_time));
  var portalUrl = "https://qp-homepage.netlify.app/members/sessions.html?highlight=" + booking.id;

  var inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif">Hi ' + name + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center">This is a friendly reminder that your 1-on-1 session is scheduled for <strong style="color:#fff">tomorrow</strong>. I\'m looking forward to our time together.</p>'
    // Session Details Card
    + '<div style="background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(173,155,132,.08));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:28px;margin:28px 0;text-align:center">'
    + '<p style="font-size:12px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 16px">Session Details</p>'
    + '<div style="font-family:Georgia,serif;font-size:24px;color:#5ba8b2;font-weight:700;margin-bottom:8px;line-height:1.3">' + date + '</div>'
    + '<div style="font-size:18px;color:rgba(255,255,255,.9);margin-bottom:12px">' + time + '</div>'
    + '<div style="width:50px;height:2px;background:linear-gradient(90deg,#ad9b84,#5ba8b2);margin:0 auto 16px"></div>'
    + '<p style="font-size:14px;color:rgba(255,255,255,.6);margin:0">60-Minute 1-on-1 Session</p></div>'
    // Zoom Button
    + '<div style="text-align:center;margin:28px 0">'
    + '<a href="' + esc(zoomLink) + '" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif">Join Zoom Session</a></div>'
    // Prep Tips
    + '<div style="background-color:rgba(91,168,178,.06);border-left:3px solid #5ba8b2;padding:20px 24px;margin:28px 0;border-radius:0 8px 8px 0">'
    + '<h3 style="color:#5ba8b2;margin:0 0 14px;font-size:16px;font-family:Georgia,serif">Before Your Session</h3>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Space:</strong> Find a quiet, comfortable area where you won\'t be disturbed</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Hydrate:</strong> Have water nearby</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Settle:</strong> Allow yourself 5 minutes to arrive before we begin</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Intention:</strong> If you have specific areas of concern, note them down</p></div>';

  return wrapTemplate('Your Session is Tomorrow', 'A reminder from Dr. Tracey Clark', inner, portalUrl, 'View in Patient Portal');
}

function buildFollowUpEmail(booking) {
  var name = esc(booking.name || booking.email.split("@")[0]);
  var date = esc(fmtDate(booking.date));
  var progressUrl = "https://qp-homepage.netlify.app/members/progress.html";

  var inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif">Hi ' + name + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center">Thank you for our session on <strong style="color:#fff">' + date + '</strong>. It was wonderful working with you, and I appreciate your openness and trust in this process.</p>'
    // Guidance Box
    + '<div style="background-color:rgba(91,168,178,.06);border-left:3px solid #5ba8b2;padding:20px 24px;margin:28px 0;border-radius:0 8px 8px 0">'
    + '<h3 style="color:#5ba8b2;margin:0 0 14px;font-size:16px;font-family:Georgia,serif">Post-Session Guidance</h3>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Hydrate:</strong> Drink plenty of water over the next 24\u201348 hours</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Rest:</strong> Honor your body\u2019s need for rest when it arises</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Observe:</strong> Notice any shifts \u2014 physical, emotional, or energetic</p>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px"><strong style="color:#ad9b84">Journal:</strong> Jot down any observations to share at our next session</p></div>'
    // Info Note
    + '<div style="background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(173,155,132,.08));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:20px;margin:28px 0;text-align:center">'
    + '<p style="font-size:14px;color:rgba(255,255,255,.7);margin:0;line-height:1.7">Your session notes and any recordings will be available in your patient portal once I\u2019ve reviewed everything.</p></div>'
    // CTA Button
    + '<div style="text-align:center;margin:28px 0">'
    + '<a href="' + progressUrl + '" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif">View Your Progress</a></div>';

  return wrapTemplate('Thank You', 'A follow-up from Dr. Tracey Clark', inner);
}

function buildIntakeNudgeEmail(booking) {
  var name = esc(booking.name || booking.email.split("@")[0]);
  var date = esc(fmtDate(booking.date));
  var intakeUrl = "https://qp-homepage.netlify.app/members/intake.html";

  var inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif">Hi ' + name + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center">Your session is coming up on <strong style="color:#fff">' + date + '</strong>, and I noticed you haven\u2019t completed your health intake form yet.</p>'
    // Why it matters box
    + '<div style="background-color:rgba(91,168,178,.06);border-left:3px solid #5ba8b2;padding:20px 24px;margin:28px 0;border-radius:0 8px 8px 0">'
    + '<h3 style="color:#5ba8b2;margin:0 0 14px;font-size:16px;font-family:Georgia,serif">Why This Matters</h3>'
    + '<p style="color:rgba(255,255,255,.85);margin:8px 0;line-height:1.7;font-size:14px">This form helps me understand your health history, current symptoms, and goals so I can make the most of our time together. It only takes a few minutes to complete.</p></div>'
    // CTA Button
    + '<div style="text-align:center;margin:28px 0">'
    + '<a href="' + intakeUrl + '" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif">Complete Intake Form</a></div>'
    + '<p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,.6);text-align:center;margin:20px 0 0">If you have any questions, just reply to this email.</p>';

  return wrapTemplate('Please Complete Your Intake Form', 'A quick step before your session', inner);
}

function buildExpiryWarningEmail(booking) {
  var name = esc(booking.name || booking.email.split("@")[0]);
  var date = esc(fmtDate(booking.date));
  var time = esc(fmtTime(booking.start_time));
  var payUrl = "https://qp-homepage.netlify.app/pages/one-on-sessions.html?pay=" + (booking.confirmation_token || booking.id);

  var inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif">Hi ' + name + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center">Your proposed session on <strong style="color:#fff">' + date + '</strong> at <strong style="color:#fff">' + time + '</strong> is reserved for you, but payment is still pending.</p>'
    // Warning box
    + '<div style="background:rgba(255,193,7,.08);border:1px solid rgba(255,193,7,.4);border-radius:12px;padding:20px;margin:28px 0;text-align:center">'
    + '<p style="font-size:16px;font-weight:700;color:#ffc107;margin:0 0 6px">\u26a0\ufe0f Booking Expires in ~24 Hours</p>'
    + '<p style="font-size:13px;color:rgba(255,255,255,.6);margin:0">If payment is not received, your slot will be released and made available to others.</p></div>'
    // CTA Button
    + '<div style="text-align:center;margin:28px 0">'
    + '<a href="' + payUrl + '" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif">Confirm &amp; Pay Now</a></div>'
    + '<p style="font-size:14px;line-height:1.7;color:rgba(255,255,255,.6);text-align:center;margin:20px 0 0">If you need to reschedule or have questions, just reply to this email.</p>';

  return wrapTemplate('Your Booking Expires Soon', 'Action required to keep your session', inner);
}

function buildExpiryNoticeEmail(booking) {
  var name = esc(booking.name || booking.email.split("@")[0]);
  var date = esc(fmtDate(booking.date));
  var bookingUrl = "https://qp-homepage.netlify.app/pages/one-on-sessions.html";

  var inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif">Hi ' + name + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center">Your proposed session on <strong style="color:#fff">' + date + '</strong> has expired because payment was not received within 72 hours. The time slot has been released.</p>'
    // Re-book info
    + '<div style="background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(173,155,132,.08));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:20px;margin:28px 0;text-align:center">'
    + '<p style="font-size:14px;color:rgba(255,255,255,.7);margin:0;line-height:1.7">If you\u2019d still like to book a session, you can check available times on the booking page.</p></div>'
    // CTA Button
    + '<div style="text-align:center;margin:28px 0">'
    + '<a href="' + bookingUrl + '" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif">View Available Sessions</a></div>';

  return wrapTemplate('Booking Expired', 'Your reserved session time has been released', inner);
}

// /netlify/functions/session-webhook.js
// Handles Stripe webhook for 1-on-1 session booking payments
// Triggered by checkout.session.completed where metadata.type === 'session_booking'
//
// IMPORTANT: This webhook needs its own endpoint in Stripe dashboard:
//   URL: https://qp-homepage.netlify.app/.netlify/functions/session-webhook
//   Events: checkout.session.completed
//   Use STRIPE_SESSION_WEBHOOK_SECRET env var for this endpoint's signing secret
//
// Alternatively, you can add session handling to the existing Fusion webhook
// and use a single endpoint. See notes below.

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

// Apps Script URL for sending emails (same one used by admin panel)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjTls1RhJRsObLbOSfZehJhZPx_Wm6Jaqpj3GYGabsNGFzFpCvwfLiZnIVPDIdR_JX/exec";

exports.handler = async (event) => {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    // Use a separate webhook secret for this endpoint, or fall back to the shared one
    const WEBHOOK_SECRET = process.env.STRIPE_SESSION_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
    const SITE_URL = process.env.URL || "https://qp-homepage.netlify.app";

    if (!STRIPE_SECRET_KEY || !WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing env vars:", {
        hasStripe: !!STRIPE_SECRET_KEY,
        hasWebhook: !!WEBHOOK_SECRET,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY
      });
      return { statusCode: 500, body: JSON.stringify({ error: "Missing env vars" }) };
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- Verify Stripe signature ---
    const sig = event.headers["stripe-signature"];
    if (!sig) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Stripe signature" }) };
    }

    const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, WEBHOOK_SECRET);
    console.log("Session webhook received:", stripeEvent.type);

    if (stripeEvent.type !== "checkout.session.completed") {
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    const session = stripeEvent.data.object;
    const metadata = session.metadata || {};

    // Only process session bookings (ignore Fusion/Academy purchases)
    if (metadata.type !== "session_booking") {
      console.log("Not a session booking, skipping:", metadata.type || "no type");
      return { statusCode: 200, body: JSON.stringify({ received: true, skipped: true }) };
    }

    const bookingId = metadata.booking_id;
    const email = metadata.email || session.customer_email || session.customer_details?.email;
    const stripeSessionId = session.id;
    const stripePaymentIntent = session.payment_intent || null;
    const amountPaid = typeof session.amount_total === "number" ? session.amount_total / 100 : null;

    console.log("Processing session booking payment:", {
      bookingId,
      email,
      stripeSessionId,
      amountPaid
    });

    if (!bookingId) {
      console.error("No booking_id in metadata");
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: "No booking_id" }) };
    }

    // --- Fetch the booking ---
    const { data: booking, error: fetchErr } = await supabase
      .from("session_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !booking) {
      console.error("Booking not found:", bookingId, fetchErr);
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: "Booking not found" }) };
    }

    // --- Idempotency: don't double-process ---
    if (booking.status === "paid") {
      console.log("Booking already paid, skipping:", bookingId);
      return { statusCode: 200, body: JSON.stringify({ ok: true, duplicate: true }) };
    }

    // --- Update booking to paid ---
    const { error: updateErr } = await supabase
      .from("session_bookings")
      .update({
        status: "paid",
        stripe_payment_id: stripeSessionId,
        confirmed_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("Error updating booking to paid:", updateErr);
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: "Update failed" }) };
    }

    console.log("✅ Booking updated to paid:", bookingId);

    // --- If this was a waitlist offer, update waitlist entry to 'booked' ---
    if (email) {
      const { data: waitlistEntry } = await supabase
        .from("session_waitlist")
        .select("id")
        .eq("email", email.toLowerCase())
        .eq("status", "notified")
        .limit(1);

      if (waitlistEntry && waitlistEntry.length > 0) {
        await supabase
          .from("session_waitlist")
          .update({ status: "booked" })
          .eq("id", waitlistEntry[0].id);
        console.log("✅ Waitlist entry updated to booked:", email);
      }
    }

    // --- Fetch session config for Zoom link ---
    const { data: config } = await supabase
      .from("session_config")
      .select("zoom_link, session_duration_minutes")
      .limit(1)
      .single();

    const zoomLink = config?.zoom_link || booking.zoom_link || "";
    const duration = config?.session_duration_minutes || 60;

    // --- Store zoom link on booking if not already set ---
    if (zoomLink && !booking.zoom_link) {
      await supabase
        .from("session_bookings")
        .update({ zoom_link: zoomLink })
        .eq("id", bookingId);
    }

    // --- Send confirmation email ---
    try {
      const dateObj = new Date(booking.date + "T12:00:00");
      const dateFmt = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      const timeFmt = formatTime12(booking.start_time);
      const name = booking.name || email.split("@")[0];

      const emailBody = buildConfirmationEmailHtml({
        name,
        date: dateFmt,
        time: timeFmt,
        duration,
        zoomLink,
        siteUrl: SITE_URL
      });

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          to: email,
          from: "tracey@quantumphysician.com",
          subject: `Confirmed! Your Session on ${dateFmt}`,
          body: emailBody,
          isHtml: true
        })
      });

      console.log("✅ Confirmation email sent to:", email);
    } catch (emailErr) {
      // Don't fail the webhook if email fails
      console.error("Email send error (non-fatal):", emailErr.message);
    }

    // --- Log to admin audit ---
    try {
      await supabase.from("admin_audit_log").insert({
        action: "session_paid",
        target_email: email,
        details: `Session booking paid: ${booking.date} at ${booking.start_time}. Stripe: ${stripeSessionId}. Amount: $${amountPaid}`,
        metadata: { booking_id: bookingId, stripe_session_id: stripeSessionId, amount: amountPaid },
        created_at: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error("Audit log error (non-fatal):", auditErr.message);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, booking_id: bookingId }) };

  } catch (err) {
    console.error("Session webhook error:", err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

// --- Confirmation email HTML (QP branded, matches buildSessionEmail style) ---
function buildConfirmationEmailHtml({ name, date, time, duration, zoomLink, siteUrl }) {
  const logoImg = "https://qp-homepage.netlify.app/assets/images/qp-logo.png";
  const traceyImg = "https://qp-homepage.netlify.app/assets/images/tracey-about-me.png";

  const zoomSection = zoomLink
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:28px 0;">
        <tr><td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="background:linear-gradient(135deg,#5ba8b2,#4acfd9);border-radius:50px;box-shadow:0 4px 20px rgba(91,168,178,.35);">
              <a href="${zoomLink}" target="_blank" style="display:inline-block;padding:16px 52px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">JOIN YOUR SESSION</a>
            </td></tr>
          </table>
        </td></tr>
       </table>
       <p style="margin:0;font-size:13px;color:rgba(255,255,255,.4);text-align:center;">Save this link — you'll also receive a reminder before your session.</p>`
    : `<p style="margin:16px 0;font-size:14px;color:rgba(255,255,255,.5);text-align:center;">Your Zoom link will be sent before your session.</p>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:20px;font-family:Georgia,Times New Roman,serif;background-color:#0a1322;">
<div style="max-width:600px;margin:0 auto;background-color:#0f1d34;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(91,168,178,.08);">

<!-- Header -->
<div style="background:linear-gradient(180deg,#0a1628,#0f1d34 70%,#131e3d);padding:48px 30px 36px;text-align:center;border-bottom:2px solid rgba(91,168,178,.2);">
  <img src="${logoImg}" alt="Quantum Physician" style="max-width:220px;height:auto;margin:0 auto 18px;display:block;">
  <p style="color:rgba(91,168,178,.6);font-size:11px;margin:0;letter-spacing:4px;text-transform:uppercase;font-weight:600;">Private Healing Sessions</p>
</div>

<!-- Body -->
<div style="padding:40px 36px;color:rgba(255,255,255,.82);font-size:16px;line-height:1.85;text-align:center;font-family:Georgia,Times New Roman,serif;">

  <p style="margin:0 0 8px;font-size:16px;line-height:1.85;">Hi ${escHtml(name)},</p>
  <p style="margin:0 0 28px;font-size:16px;line-height:1.85;">Your session is <strong style="color:#5ba8b2;">confirmed and paid</strong>. Here are your details:</p>

  <!-- Appointment Card -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:28px 0;">
    <tr><td style="background:linear-gradient(135deg,rgba(91,168,178,.1),rgba(91,168,178,.03));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:0;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,#5ba8b2,#4acfd9,rgba(91,168,178,.15));"></div>
      <div style="padding:28px 32px;text-align:center;">
        <p style="margin:0;font-size:13px;color:rgba(91,168,178,.7);letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Appointment</p>
        <p style="margin:12px 0 4px;font-size:22px;color:#5ba8b2;font-weight:700;">${escHtml(date)}</p>
        <p style="margin:0;font-size:18px;color:rgba(255,255,255,.7);">${escHtml(time)} · ${duration} minutes</p>
        <div style="margin:16px auto 0;width:40px;height:1px;background:rgba(91,168,178,.3);"></div>
        <p style="margin:12px 0 0;font-size:14px;color:rgba(255,255,255,.4);">
          <span style="color:#5ba8b2;">✓</span> Payment confirmed
        </p>
      </div>
    </td></tr>
  </table>

  ${zoomSection}

  <p style="margin:28px 0 0;font-size:15px;line-height:1.8;color:rgba(255,255,255,.6);">
    <span style="color:#5ba8b2;margin-right:8px;">✦</span> A personalized, integrative healing session via Zoom<br>
    <span style="color:#5ba8b2;margin-right:8px;">✦</span> Practical guidance tailored to your needs<br>
    <span style="color:#5ba8b2;margin-right:8px;">✦</span> Follow-up resources to support your journey
  </p>

  <p style="margin:28px 0 0;font-size:14px;color:rgba(255,255,255,.45);">
    Need to reschedule? Reply to this email at least 48 hours before your session.
  </p>
</div>

<!-- Sign-off -->
<div style="padding:30px 36px;border-top:1px solid rgba(91,168,178,.1);text-align:center;background:linear-gradient(180deg,transparent,rgba(91,168,178,.03));">
  <img src="${traceyImg}" alt="Dr. Tracey Clark" style="width:80px;height:80px;border-radius:50%;border:2px solid rgba(91,168,178,.3);object-fit:cover;display:block;margin:0 auto 14px;">
  <p style="margin:0;color:rgba(255,255,255,.5);font-size:14px;font-family:Georgia,serif;">Looking forward to our session,</p>
  <p style="margin:6px 0 0;color:#5ba8b2;font-weight:700;font-size:19px;font-family:Georgia,serif;">Dr. Tracey Clark</p>
  <p style="margin:4px 0 0;color:rgba(255,255,255,.3);font-size:12px;letter-spacing:1.5px;">Quantum Physician</p>
</div>

<!-- Footer -->
<div style="background:linear-gradient(180deg,#0a1628,#071220);padding:22px 30px;text-align:center;border-top:1px solid rgba(91,168,178,.06);">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,.2);">&copy; 2026 Quantum Physician. All rights reserved.</p>
  <p style="margin:8px 0 0;font-size:10px;"><a href="https://qp-homepage.netlify.app" style="color:rgba(91,168,178,.35);text-decoration:none;">quantumphysician.com</a></p>
</div>

</div>
</body></html>`;
}

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return h12 + ":" + String(m).padStart(2, "0") + " " + ampm;
}

function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

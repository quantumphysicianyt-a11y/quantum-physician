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

// Apps Script URL for sending emails — set SESSION_EMAIL_SCRIPT_URL in Netlify env vars
const APPS_SCRIPT_URL = process.env.SESSION_EMAIL_SCRIPT_URL;

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
        hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
        hasEmailScript: !!APPS_SCRIPT_URL
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
      .select("zoom_link, session_duration_minutes, session_price")
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

    // --- Auto-generate paid invoice + PDF ---
    try {
      // Fetch session price from config
      const sessionPrice = config?.session_price || (amountPaid ? amountPaid : 150);
      const invoiceAmountCents = Math.round(sessionPrice * 100);

      // Generate invoice number via DB function
      const { data: invNumber, error: seqErr } = await supabase.rpc("generate_invoice_number");
      if (seqErr) throw new Error("Invoice number generation failed: " + seqErr.message);

      const now = new Date().toISOString();
      const clientName = booking.name || (email ? email.split("@")[0] : "Client");

      // Create invoice record
      const { data: newInvoice, error: invErr } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invNumber,
          booking_id: bookingId,
          client_id: booking.client_id || null,
          email: email,
          name: clientName,
          description: "1-on-1 Healing Session (60 min)",
          amount_cents: invoiceAmountCents,
          currency: "USD",
          tax_cents: 0,
          total_cents: invoiceAmountCents,
          status: "paid",
          issued_at: now,
          paid_at: now,
          due_date: new Date().toISOString().slice(0, 10),
          stripe_payment_id: stripeSessionId,
          pay_url: null,
          notes: "Thank you for your trust in this healing journey."
        })
        .select("id, invoice_number")
        .single();

      if (invErr) throw new Error("Invoice insert failed: " + invErr.message);

      console.log("✅ Invoice created:", newInvoice.invoice_number);

      // Generate branded PDF via generate-invoice function (internal call)
      const SITE = process.env.URL || "https://qp-homepage.netlify.app";
      let pdfUrl = null;
      try {
        const pdfRes = await fetch(SITE + "/.netlify/functions/generate-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice_id: newInvoice.id, internal: true })
        });
        const pdfData = await pdfRes.json();
        if (pdfData.pdf_url) {
          pdfUrl = pdfData.pdf_url;
          console.log("✅ Invoice PDF generated:", newInvoice.invoice_number);
        }
      } catch (pdfErr) {
        console.error("PDF generation error (non-fatal):", pdfErr.message);
      }

      // Send paid invoice email to client
      const dateObj2 = new Date(booking.date + "T12:00:00");
      const dateFmt2 = dateObj2.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
      const timeFmt2 = formatTime12(booking.start_time);

      const invoiceEmailHtml = buildPaidInvoiceEmailHtml({
        name: clientName,
        invoiceNumber: newInvoice.invoice_number,
        sessionDate: dateFmt2,
        sessionTime: timeFmt2,
        amount: "$" + (invoiceAmountCents / 100).toFixed(2),
        paidDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        pdfUrl: pdfUrl
      });

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          to: email,
          from: "tracey@quantumphysician.com",
          subject: `Paid Invoice ${newInvoice.invoice_number} — Quantum Physician`,
          body: invoiceEmailHtml,
          isHtml: true
        })
      });

      console.log("✅ Paid invoice email sent to:", email, newInvoice.invoice_number);

    } catch (invoiceErr) {
      // Never fail the webhook over an invoice error
      console.error("Auto-invoice error (non-fatal):", invoiceErr.message);
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


// --- Paid Invoice email HTML (QP branded — matches premium reminder template style) ---
function buildPaidInvoiceEmailHtml({ name, invoiceNumber, sessionDate, sessionTime, amount, paidDate, pdfUrl }) {

  const pdfBtn = pdfUrl
    ? '<div style="text-align:center;margin:28px 0;">'
      + '<a href="' + pdfUrl + '" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#5ba8b2,#4a97a1);color:#fff;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Download Invoice PDF</a>'
      + '</div>'
    : '';

  const inner = '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif;">Hi ' + escHtml(name) + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center;">Thank you for your payment. Here is your paid invoice for your records.</p>'
    // Invoice summary card
    + '<div style="background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(173,155,132,.08));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:28px;margin:28px 0;">'
    + '<p style="font-size:12px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;text-align:center;">Invoice Summary</p>'
    + '<p style="font-family:Georgia,serif;font-size:22px;color:#5ba8b2;font-weight:700;margin:0 0 20px;text-align:center;">' + escHtml(invoiceNumber) + '</p>'
    + '<table style="width:100%;border-collapse:collapse;">'
    + '<tr><td style="color:rgba(255,255,255,.5);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);">Description</td><td style="color:rgba(255,255,255,.85);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);text-align:right;">1-on-1 Healing Session</td></tr>'
    + '<tr><td style="color:rgba(255,255,255,.5);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);">Session Date</td><td style="color:rgba(255,255,255,.85);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);text-align:right;">' + escHtml(sessionDate) + '</td></tr>'
    + '<tr><td style="color:rgba(255,255,255,.5);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);">Time</td><td style="color:rgba(255,255,255,.85);font-size:13px;padding:8px 0;border-bottom:1px solid rgba(91,168,178,.1);text-align:right;">' + escHtml(sessionTime) + '</td></tr>'
    + '<tr><td style="color:#3dd68c;font-size:15px;font-weight:700;padding:12px 0 0;">Total Paid</td><td style="color:#3dd68c;font-size:20px;font-weight:700;padding:12px 0 0;text-align:right;">' + escHtml(amount) + '</td></tr>'
    + '</table>'
    + '<div style="text-align:center;margin-top:18px;">'
    + '<span style="display:inline-block;background:rgba(61,214,140,.15);color:#3dd68c;padding:6px 20px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;">✓ PAID — ' + escHtml(paidDate) + '</span>'
    + '</div></div>'
    + pdfBtn
    + '<p style="font-size:13px;color:rgba(255,255,255,.45);text-align:center;margin:8px 0 0;">Keep this email for your records. You can also view your invoices in your <a href="https://qp-homepage.netlify.app/members/billing.html" style="color:#5ba8b2;text-decoration:underline;">patient portal</a>.</p>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:20px;font-family:Georgia,\'Times New Roman\',serif;background-color:#f4f1ec;">'
    + '<div style="max-width:600px;margin:0 auto;background-color:#0e1a30;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.3);">'
    + '<div style="background:linear-gradient(135deg,#0e1a30,#12283e 50%,#1a3a4a);padding:40px 30px;text-align:center;border-bottom:2px solid rgba(91,168,178,.3);">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/qp-logo.png" alt="Quantum Physician" style="max-width:180px;height:auto;margin:0 auto 24px;display:block;">'
    + '<h1 style="font-family:Georgia,serif;font-size:32px;font-weight:700;color:#5ba8b2;margin:0 0 8px;letter-spacing:1px;">Paid Invoice</h1>'
    + '<p style="color:rgba(255,255,255,.7);font-size:15px;margin:0;font-style:italic;">From Dr. Tracey Clark — Quantum Physician</p>'
    + '</div>'
    + '<div style="padding:40px 30px;color:rgba(255,255,255,.85);">'
    + inner
    + '<div style="margin-top:32px;padding:28px;border-top:1px solid rgba(91,168,178,.15);text-align:center;">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/tracey-about-me.png" alt="Dr. Tracey Clark" style="width:90px;height:90px;border-radius:50%;border:2px solid rgba(91,168,178,.3);object-fit:cover;display:block;margin:0 auto 16px;">'
    + '<p style="margin:0;color:rgba(255,255,255,.7);font-size:14px;">With care,</p>'
    + '<p style="margin:6px 0 0;font-weight:700;font-size:18px;color:#5ba8b2;font-family:Georgia,serif;">Dr. Tracey Clark</p>'
    + '<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.4);">Quantum Physician | BodyTalk Practitioner</p>'
    + '</div></div>'
    + '<div style="background-color:#081420;padding:24px 20px;text-align:center;color:rgba(255,255,255,.35);font-size:12px;border-top:1px solid rgba(91,168,178,.1);">'
    + '<p style="margin:6px 0;"><strong>Quantum Physician</strong></p>'
    + '<p style="margin:6px 0;">&copy; 2026 Quantum Physician. All rights reserved.</p>'
    + '<p style="margin:10px 0;"><a href="https://qp-homepage.netlify.app/members/billing.html" style="color:#5ba8b2;text-decoration:none;font-size:11px;">View in Patient Portal</a></p>'
    + '</div></div></body></html>';
}

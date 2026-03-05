// /netlify/functions/stripe-refund.js
// Processes session booking cancellations with 24-hour policy enforcement

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const APPS_SCRIPT_URL = process.env.SESSION_EMAIL_SCRIPT_URL;

function escHtml(s) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmtDateLong(dateStr) {
  return new Date(dateStr + "T12:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
}

function fmtTime(t) {
  if (!t) return "TBD";
  const parts = t.split(":");
  const h = parseInt(parts[0]), m = parts[1] || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h > 12 ? h - 12 : h || 12}:${m} ${ampm}`;
}

function buildCancellationEmailHtml({ name, sessionDate, sessionTime, amount, refunded }) {
  const title = refunded ? "Session Cancelled" : "Session Cancelled — No Refund";
  const subtitle = refunded ? "Your refund is on its way" : "Cancelled within 24 hours of your session";

  const policyBox = refunded
    ? '<div style="background:linear-gradient(135deg,rgba(61,214,140,.08),rgba(61,214,140,.03));border:1px solid rgba(61,214,140,.25);border-radius:12px;padding:20px 24px;margin:28px 0;text-align:center;"><p style="color:#3dd68c;font-size:15px;font-weight:700;margin:0 0 6px;">Refund Issued</p><p style="color:rgba(255,255,255,.7);font-size:13px;margin:0;">A full refund of <strong style="color:#fff;">' + escHtml(amount) + '</strong> has been initiated. Please allow 5–10 business days to appear on your statement.</p></div>'
    : '<div style="background:linear-gradient(135deg,rgba(232,93,93,.08),rgba(232,93,93,.03));border:1px solid rgba(232,93,93,.25);border-radius:12px;padding:20px 24px;margin:28px 0;text-align:center;"><p style="color:#e85d5d;font-size:15px;font-weight:700;margin:0 0 6px;">No Refund Issued</p><p style="color:rgba(255,255,255,.7);font-size:13px;margin:0;">This session was cancelled within 24 hours of the scheduled start time. Per our cancellation policy, the session fee of <strong style="color:#fff;">' + escHtml(amount) + '</strong> is non-refundable.</p></div>';

  const sessionCard = '<div style="background:linear-gradient(135deg,rgba(91,168,178,.08),rgba(173,155,132,.08));border:1px solid rgba(91,168,178,.25);border-radius:12px;padding:24px;margin:28px 0;text-align:center;"><p style="font-size:12px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Cancelled Session</p><div style="font-family:Georgia,serif;font-size:22px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:6px;text-decoration:line-through;">' + escHtml(sessionDate) + '</div><div style="font-size:16px;color:rgba(255,255,255,.4);">' + escHtml(sessionTime) + '</div></div>';

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:20px;font-family:Georgia,\'Times New Roman\',serif;background-color:#f4f1ec;">'
    + '<div style="max-width:600px;margin:0 auto;background-color:#0e1a30;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.3);">'
    + '<div style="background:linear-gradient(135deg,#0e1a30,#12283e 50%,#1a3a4a);padding:40px 30px;text-align:center;border-bottom:2px solid rgba(91,168,178,.3);">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/qp-logo.png" alt="Quantum Physician" style="max-width:180px;height:auto;margin:0 auto 24px;display:block;">'
    + '<h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#5ba8b2;margin:0 0 8px;letter-spacing:1px;">' + escHtml(title) + '</h1>'
    + '<p style="color:rgba(255,255,255,.7);font-size:15px;margin:0;font-style:italic;">' + escHtml(subtitle) + '</p>'
    + '</div>'
    + '<div style="padding:40px 30px;color:rgba(255,255,255,.85);">'
    + '<p style="font-size:20px;color:#5ba8b2;margin-bottom:20px;text-align:center;font-family:Georgia,serif;">Hi ' + escHtml(name) + ',</p>'
    + '<p style="font-size:15px;line-height:1.8;color:rgba(255,255,255,.85);margin-bottom:24px;text-align:center;">Your session has been cancelled. Here are the details.</p>'
    + sessionCard + policyBox
    + '<p style="font-size:13px;color:rgba(255,255,255,.5);text-align:center;margin:24px 0 0;">To book a new session, visit your <a href="https://qp-homepage.netlify.app/pages/one-on-sessions.html" style="color:#5ba8b2;text-decoration:underline;">patient portal</a>.</p>'
    + '<div style="margin-top:32px;padding:28px;border-top:1px solid rgba(91,168,178,.15);text-align:center;">'
    + '<img src="https://qp-homepage.netlify.app/assets/images/tracey-about-me.png" alt="Dr. Tracey Clark" style="width:90px;height:90px;border-radius:50%;border:2px solid rgba(91,168,178,.3);object-fit:cover;display:block;margin:0 auto 16px;">'
    + '<p style="margin:0;color:rgba(255,255,255,.7);font-size:14px;">With care,</p>'
    + '<p style="margin:6px 0 0;font-weight:700;font-size:18px;color:#5ba8b2;font-family:Georgia,serif;">Dr. Tracey Clark</p>'
    + '<p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.4);">Quantum Physician | BodyTalk Practitioner</p>'
    + '</div></div>'
    + '<div style="background-color:#081420;padding:24px 20px;text-align:center;color:rgba(255,255,255,.35);font-size:12px;border-top:1px solid rgba(91,168,178,.1);">'
    + '<p style="margin:6px 0;"><strong>Quantum Physician</strong></p>'
    + '<p style="margin:6px 0;">&copy; 2026 Quantum Physician. All rights reserved.</p>'
    + '<p style="margin:10px 0;"><a href="https://qp-homepage.netlify.app/members/sessions.html" style="color:#5ba8b2;text-decoration:none;font-size:11px;">View Sessions</a></p>'
    + '</div></div></body></html>';
}

async function sendCancellationEmail({ email, name, sessionDate, sessionTime, amount, refunded }) {
  if (!APPS_SCRIPT_URL) { console.warn("[stripe-refund] No SESSION_EMAIL_SCRIPT_URL set"); return; }
  const subject = refunded
    ? "Your session has been cancelled — refund issued"
    : "Your session has been cancelled — no refund";
  const html = buildCancellationEmailHtml({ name, sessionDate, sessionTime, amount, refunded });
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: email, subject, htmlBody: html, isHtml: true }),
    });
  } catch (e) { console.error("[stripe-refund] Email send error:", e.message); }
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!STRIPE_SECRET_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing Stripe env vars" }) };

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

  try {
    const { stripe_session_id, booking_id, email, amount, initiated_by } = JSON.parse(event.body || "{}");

    if (!stripe_session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing stripe_session_id" }) };

    // --- Fetch booking to check 24hr window ---
    let booking = null;
    let withinPolicy = false;

    if (supabase && booking_id) {
      const { data } = await supabase.from("session_bookings").select("*").eq("id", booking_id).maybeSingle();
      booking = data;
    }

    if (booking) {
      const sessionDateTime = new Date(booking.date + "T" + (booking.start_time || "00:00:00"));
      const now = new Date();
      const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
      withinPolicy = hoursUntilSession < 24;
      console.log("[stripe-refund] Hours until session: " + hoursUntilSession.toFixed(1) + " — within 24hr policy: " + withinPolicy);
    }

    const clientEmail = email || (booking && booking.email) || "";
    const clientName = (booking && booking.name) || clientEmail.split("@")[0];
    const sessionDate = booking ? fmtDateLong(booking.date) : "your session";
    const sessionTime = booking ? fmtTime(booking.start_time) : "";
    const amountStr = booking && booking.amount_paid
      ? "$" + Number(booking.amount_paid).toFixed(2)
      : (amount ? "$" + Number(amount).toFixed(2) : "");

    const isClientCancelled = initiated_by === "client";

    if (withinPolicy) {
      // Within 24hrs — no refund
      console.log("[stripe-refund] Within 24hr window — no refund issued");
      if (supabase && booking_id) {
        await supabase.from("session_bookings").update({
          status: "cancelled_no_refund",
          cancelled_at: new Date().toISOString(),
          client_cancelled: isClientCancelled,
          admin_acknowledged: !isClientCancelled,
        }).eq("id", booking_id);
      }
      await sendCancellationEmail({ email: clientEmail, name: clientName, sessionDate, sessionTime, amount: amountStr, refunded: false });
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ success: true, refunded: false, within_policy: true, message: "Cancelled. Within 24-hour window — no refund issued." }),
      };
    }

    // Outside 24hrs — process Stripe refund
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id);

    if (!session.payment_intent) {
      if (supabase && booking_id) {
        await supabase.from("session_bookings").update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          client_cancelled: isClientCancelled,
          admin_acknowledged: !isClientCancelled,
        }).eq("id", booking_id);
      }
      await sendCancellationEmail({ email: clientEmail, name: clientName, sessionDate, sessionTime, amount: amountStr, refunded: false });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, refunded: false, message: "Cancelled (no payment to refund)." }) };
    }

    const refund = await stripe.refunds.create({
      payment_intent: session.payment_intent,
      reason: "requested_by_customer",
    });

    console.log("[stripe-refund] Refund created:", refund.id, "$" + (refund.amount / 100));

    if (supabase && booking_id) {
      await supabase.from("session_bookings").update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        client_cancelled: isClientCancelled,
        admin_acknowledged: !isClientCancelled,
      }).eq("id", booking_id);
    }

    if (supabase && clientEmail) {
      const { data: purchase } = await supabase.from("purchases").select("id, product_id").eq("stripe_session_id", stripe_session_id).maybeSingle();
      if (purchase && !purchase.product_id.startsWith("refunded__") && !purchase.product_id.startsWith("revoked__")) {
        await supabase.from("purchases").update({ product_id: "refunded__" + purchase.product_id }).eq("id", purchase.id);
      }
    }

    await sendCancellationEmail({ email: clientEmail, name: clientName, sessionDate, sessionTime, amount: amountStr, refunded: true });

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, refunded: true, within_policy: false, refund_id: refund.id, amount_refunded: refund.amount / 100, status: refund.status }),
    };

  } catch (err) {
    console.error("[stripe-refund] Error:", err);
    if (err.type === "StripeInvalidRequestError") {
      return { statusCode: 400, headers, body: JSON.stringify({ error: err.message || "Invalid refund request." }) };
    }
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

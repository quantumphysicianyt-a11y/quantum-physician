// /netlify/functions/session-checkout.js
// Creates Stripe Checkout session for 1-on-1 session bookings
// Two modes:
//   1. Token-based: existing proposed booking → pay via confirmation_token
//      Uses booking-level price snapshot (amount_cents, currency) from Session 36
//   2. Public booking: new slot selection → create booking + pay
//
// Session 37: Multi-currency (EUR/CAD), booking-level pricing, regular client confirm-only

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
    const SITE_URL = process.env.URL || "https://qp-homepage.netlify.app";

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing env vars" }) };
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const body = JSON.parse(event.body || "{}");

    // --- Fetch session config (fallback price, duration, zoom link) ---
    const { data: config, error: configErr } = await supabase
      .from("session_config")
      .select("*")
      .limit(1)
      .single();

    if (configErr || !config) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Session config not found" }) };
    }

    let booking = null;

    // ===== MODE 1: Token-based checkout (from email CTA or confirmation portal) =====
    if (body.token) {
      const { data: existing, error: tokenErr } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("confirmation_token", body.token)
        .single();

      if (tokenErr || !existing) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: "Booking not found or invalid token" }) };
      }

      if (existing.status === "paid") {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "This booking is already paid", status: "paid" }) };
      }

      if (existing.status !== "proposed" && existing.status !== "confirmed") {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Booking status is '" + existing.status + "' \u2014 cannot pay", status: existing.status }) };
      }

      // --- Check if this is a regular client doing a confirm-only action ---
      if (body.action === "confirm") {
        // Regular client: just confirm the date, no payment
        if (existing.status === "proposed") {
          const { error: confirmErr } = await supabase
            .from("session_bookings")
            .update({
              status: "confirmed",
              confirmed_at: new Date().toISOString()
            })
            .eq("id", existing.id);

          if (confirmErr) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to confirm booking" }) };
          }

          console.log("\u2705 Regular client confirmed date:", existing.id, existing.email);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              confirmed: true,
              booking_id: existing.id,
              date: existing.date,
              start_time: existing.start_time,
              message: "Your date is confirmed! You\u2019ll receive a payment link before your session."
            }),
          };
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ error: "Booking is already confirmed", status: existing.status }) };
        }
      }

      // --- Check expiry based on client type ---
      if (existing.proposed_at) {
        // Look up client to determine expiry window
        let expiryHours = 72; // default for public clients
        if (existing.client_id) {
          const { data: client } = await supabase
            .from("session_clients")
            .select("client_type")
            .eq("id", existing.client_id)
            .single();
          if (client && client.client_type === "regular") {
            expiryHours = 7 * 24; // 7 days for regulars
          }
        }

        const proposedAt = new Date(existing.proposed_at);
        const expiresAt = new Date(proposedAt.getTime() + expiryHours * 60 * 60 * 1000);
        if (new Date() > expiresAt) {
          await supabase.from("session_bookings").update({ status: "expired" }).eq("id", existing.id);
          return { statusCode: 410, headers, body: JSON.stringify({ error: "This offer has expired" }) };
        }
      }

      booking = existing;

    // ===== MODE 2: Public booking (new slot from frontend calendar) =====
    } else if (body.email && body.date && body.start_time) {
      const email = body.email.toLowerCase().trim();
      const date = body.date;       // YYYY-MM-DD
      const startTime = body.start_time; // HH:MM
      const duration = config.session_duration_minutes || 60;

      // Compute end_time
      const [sh, sm] = startTime.split(":").map(Number);
      let endM = sm + duration;
      let endH = sh + Math.floor(endM / 60);
      endM = endM % 60;
      const endTime = String(endH).padStart(2, "0") + ":" + String(endM).padStart(2, "0");

      // Verify the slot is actually available
      const { data: avail } = await supabase
        .from("session_availability")
        .select("*")
        .eq("date", date)
        .eq("status", "available")
        .in("visibility", ["public"]);

      if (!avail || avail.length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "This date is not available for booking" }) };
      }

      // Check slot isn't already taken
      const { data: conflicts } = await supabase
        .from("session_bookings")
        .select("id")
        .eq("date", date)
        .eq("start_time", startTime)
        .in("status", ["proposed", "paid"]);

      if (conflicts && conflicts.length > 0) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: "This time slot is already booked" }) };
      }

      // Find active cycle
      const { data: cycles } = await supabase
        .from("session_cycles")
        .select("id")
        .in("status", ["active", "public_open"])
        .order("start_date", { ascending: false })
        .limit(1);

      const cycleId = cycles && cycles.length > 0 ? cycles[0].id : null;

      // Generate confirmation token
      const token = crypto.randomBytes(32).toString("hex");

      // Find default session type (first active)
      const { data: sessionTypes } = await supabase
        .from("session_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(1);

      const defaultType = sessionTypes && sessionTypes.length > 0 ? sessionTypes[0] : null;

      // Create the proposed booking with price snapshot
      const { data: newBooking, error: insertErr } = await supabase
        .from("session_bookings")
        .insert({
          cycle_id: cycleId,
          email: email,
          name: body.name || "",
          date: date,
          start_time: startTime,
          end_time: endTime,
          status: "proposed",
          type: "public",
          session_type_id: defaultType ? defaultType.id : null,
          amount_cents: defaultType ? defaultType.price_cents : Math.round((config.session_price || 150) * 100),
          currency: defaultType ? defaultType.currency : "EUR",
          confirmation_token: token,
          proposed_at: new Date().toISOString(),
          notes: "Public booking \u2014 pending payment"
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Error creating booking:", insertErr);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to create booking" }) };
      }

      booking = newBooking;

    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Provide either 'token' or 'email + date + start_time'" }) };
    }

    // ===== Resolve price + currency from booking snapshot =====
    let priceInCents = booking.amount_cents;
    let currency = (booking.currency || "eur").toLowerCase();
    let duration = config.session_duration_minutes || 30;
    let typeName = "Private Healing Session";

    // If booking has a session_type_id, fetch for display name + duration
    if (booking.session_type_id) {
      const { data: st } = await supabase
        .from("session_types")
        .select("name, duration_minutes")
        .eq("id", booking.session_type_id)
        .single();
      if (st) {
        typeName = st.name || typeName;
        duration = st.duration_minutes || duration;
      }
    }

    // Fallback if amount_cents not set on booking (legacy bookings)
    if (!priceInCents) {
      priceInCents = Math.round((config.session_price || 150) * 100);
      currency = "eur";
    }

    // --- Check if client has tax (Canadian HST) ---
    let taxLabel = null;
    let taxRate = 0;
    let taxCents = 0;
    if (booking.client_id) {
      const { data: client } = await supabase
        .from("session_clients")
        .select("tax_label, tax_rate")
        .eq("id", booking.client_id)
        .single();
      if (client && client.tax_label && client.tax_rate) {
        taxLabel = client.tax_label;
        taxRate = parseFloat(client.tax_rate);
        taxCents = Math.round(priceInCents * taxRate / 100);
      }
    }

    const totalCents = priceInCents + taxCents;

    // ===== Create Stripe Checkout Session =====
    const dateObj = new Date(booking.date + "T12:00:00");
    const dateFmt = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const timeFmt = formatTime12(booking.start_time);

    const descParts = [timeFmt, duration + " min", typeName];
    if (taxLabel) {
      descParts.push(taxLabel + " (" + taxRate + "%) included");
    }

    const lineItems = [{
      price_data: {
        currency: currency,
        product_data: {
          name: typeName + " \u2014 " + dateFmt,
          description: descParts.join("  \u00B7  "),
          images: ["https://qp-homepage.netlify.app/assets/images/1on1-sessions-payment.png"],
        },
        unit_amount: totalCents,
      },
      quantity: 1,
    }];

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: booking.email,
      mode: "payment",
      success_url: SITE_URL + "/pages/one-on-sessions.html?payment=success&booking_id=" + booking.id,
      cancel_url: SITE_URL + "/pages/one-on-sessions.html?payment=cancelled",
      metadata: {
        type: "session_booking",
        booking_id: booking.id,
        email: booking.email,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        cycle_id: booking.cycle_id || "",
        confirmation_token: booking.confirmation_token || "",
        currency: currency,
        amount_cents: String(priceInCents),
        tax_cents: String(taxCents),
        tax_label: taxLabel || ""
      },
      line_items: lineItems,
    });

    console.log("\u2705 Session checkout created:", {
      bookingId: booking.id,
      email: booking.email,
      date: booking.date,
      amount: totalCents,
      currency: currency,
      tax: taxLabel ? taxLabel + " " + taxCents + "c" : "none",
      checkoutUrl: checkoutSession.url
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: checkoutSession.url,
        booking_id: booking.id,
        token: booking.confirmation_token
      }),
    };

  } catch (err) {
    console.error("Session checkout error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

function formatTime12(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return h12 + ":" + String(m).padStart(2, "0") + " " + ampm;
}

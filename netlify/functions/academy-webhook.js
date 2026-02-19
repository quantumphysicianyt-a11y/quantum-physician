const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

// Academy bundle courses
const BUNDLE_COURSES = [
  "quantum-vision-boards",
  "becoming-present",
  "breaking-up-with-your-beliefs",
  "creative-mind-mapping",
  "power-of-the-question",
];

const PRODUCT_NAMES = {
  "quantum-vision-boards": "Quantum Vision Boards",
  "becoming-present": "Becoming Present",
  "breaking-up-with-your-beliefs": "Breaking Up with Your Beliefs",
  "creative-mind-mapping": "Creative Mind Mapping",
  "power-of-the-question": "The Power of The Question",
  "transformational-mastery": "Transformational Mastery Program",
};

exports.handler = async (event) => {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_ACADEMY_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error("Missing env vars");
      return { statusCode: 500, body: JSON.stringify({ error: "Missing env vars" }) };
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verify Stripe signature
    const sig = event.headers["stripe-signature"];
    if (!sig) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Stripe signature" }) };
    }

    const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
    console.log("Academy webhook received:", stripeEvent.type);

    if (stripeEvent.type !== "checkout.session.completed") {
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    const session = stripeEvent.data.object;
    const metadata = session.metadata || {};

    // Only process academy purchases
    if (metadata.source !== "academy") {
      console.log("Not an academy purchase, skipping");
      return { statusCode: 200, body: JSON.stringify({ received: true, skipped: "not academy" }) };
    }

    const buyerEmail = session.customer_email || metadata.email || session.customer_details?.email;
    const productId = metadata.productId;
    const isBundle = metadata.isBundle === "true";
    const courseSlugs = (metadata.courseSlugs || "").split(",").filter(Boolean);
    const referralCodeUsed = metadata.referralCode || null;
    const creditsUsed = parseFloat(metadata.creditsUsed || "0");

    const stripeSessionId = session.id;
    const stripePaymentIntent = session.payment_intent || null;
    const amountPaid = typeof session.amount_total === "number" ? session.amount_total / 100 : null;

    console.log("Academy purchase:", {
      stripeSessionId, buyerEmail, productId, isBundle, courseSlugs, amountPaid, creditsUsed
    });

    if (!buyerEmail) {
      console.error("No buyer email found");
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: "No email" }) };
    }

    if (!productId) {
      console.error("No product ID found");
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: "No product" }) };
    }

    // --- Check for duplicate ---
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();

    if (existingPurchase) {
      console.log("Duplicate purchase, skipping:", stripeSessionId);
      return { statusCode: 200, body: JSON.stringify({ ok: true, duplicate: true }) };
    }

    // --- Insert purchases ---
    const productsToGrant = isBundle
      ? ["transformational-mastery", ...BUNDLE_COURSES]
      : [productId];

    for (const pid of productsToGrant) {
      const purchaseRow = {
        stripe_session_id: pid === productId ? stripeSessionId : `${stripeSessionId}-${pid}`,
        stripe_payment_intent: stripePaymentIntent,
        product_id: pid,
        amount_paid: pid === productId ? amountPaid : 0,
        email: buyerEmail.toLowerCase(),
        referral_code_used: referralCodeUsed,
        purchased_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("purchases").insert([purchaseRow]);
      if (error) {
        if (error.code === "23505") {
          console.log("Duplicate row, skipping:", pid);
        } else {
          console.error("Failed inserting purchase for", pid, ":", error);
        }
      } else {
        console.log("✅ Purchase inserted:", pid);
      }
    }

    // --- Grant academy access (qa_enrollments) ---
    await grantAcademyAccess(supabase, buyerEmail, courseSlugs);

    // --- Deduct credits ---
    if (creditsUsed > 0) {
      const { data: buyerCredits } = await supabase
        .from("referral_codes")
        .select("id, credit_balance")
        .eq("email", buyerEmail.toLowerCase())
        .maybeSingle();

      if (buyerCredits) {
        const newBalance = Math.max(0, Number(buyerCredits.credit_balance || 0) - creditsUsed);
        await supabase.from("referral_codes")
          .update({ credit_balance: newBalance })
          .eq("id", buyerCredits.id);

        await supabase.from("credit_history").insert([{
          email: buyerEmail.toLowerCase(),
          amount: -creditsUsed,
          type: "purchase",
          description: `Used for ${PRODUCT_NAMES[productId] || productId}`,
          created_at: new Date().toISOString(),
        }]);

        console.log("✅ Credits deducted:", { creditsUsed, newBalance });
      }
    }

    // --- Referral credit ---
    if (referralCodeUsed && buyerEmail) {
      const { data: refRow } = await supabase
        .from("referral_codes")
        .select("id, email, code, credit_balance, total_earned, successful_referrals")
        .eq("code", referralCodeUsed)
        .maybeSingle();

      if (refRow && refRow.email.toLowerCase() !== buyerEmail.toLowerCase()) {
        const creditToAdd = isBundle ? 25 : 10;
        const newCredit = Number(refRow.credit_balance || 0) + creditToAdd;

        await supabase.from("referral_codes")
          .update({
            credit_balance: newCredit,
            total_earned: Number(refRow.total_earned || 0) + creditToAdd,
            successful_referrals: Number(refRow.successful_referrals || 0) + 1,
          })
          .eq("id", refRow.id);

        await supabase.from("credit_history").insert([{
          email: refRow.email,
          amount: creditToAdd,
          type: isBundle ? "referral_bundle" : "referral_course",
          description: `Referral reward: ${buyerEmail} purchased ${PRODUCT_NAMES[productId] || productId}`,
          created_at: new Date().toISOString(),
        }]);

        console.log("✅ Referral credit added:", { code: referralCodeUsed, creditToAdd, newBalance: newCredit });
      }
    }

    // --- Generate referral code for buyer ---
    if (buyerEmail) {
      const { data: existingCodes } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("email", buyerEmail.toLowerCase())
        .limit(1);

      if (!existingCodes || existingCodes.length === 0) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let newCode = "";
        for (let i = 0; i < 8; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));

        await supabase.from("referral_codes").insert([{
          email: buyerEmail.toLowerCase(),
          code: newCode,
          credit_balance: 0,
          total_earned: 0,
          successful_referrals: 0,
          created_at: new Date().toISOString(),
        }]);
        console.log("✅ Created referral code", newCode, "for", buyerEmail);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error("Academy webhook error:", err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

async function grantAcademyAccess(supabase, email, courseSlugs) {
  try {
    // Find user profile
    const { data: profiles } = await supabase
      .from("qa_profiles")
      .select("id")
      .eq("email", email.toLowerCase());

    let userId = profiles && profiles.length > 0 ? profiles[0].id : null;

    if (!userId) {
      console.log("No qa_profile for", email, "- will enroll on first login");
      return;
    }

    // Get course IDs from slugs
    const { data: courses } = await supabase
      .from("qa_courses")
      .select("id, slug")
      .in("slug", courseSlugs);

    if (!courses || courses.length === 0) {
      console.log("No courses found for:", courseSlugs);
      return;
    }

    for (const course of courses) {
      const { error } = await supabase.from("qa_enrollments").upsert({
        user_id: userId,
        course_id: course.id,
        status: "active",
        enrolled_at: new Date().toISOString()
      }, { onConflict: "user_id,course_id" });

      if (error) {
        console.error("Enrollment error for", course.slug, ":", error);
      } else {
        console.log("✅ Enrolled", email, "in", course.slug);
      }
    }
  } catch (err) {
    console.error("Academy access grant error:", err);
  }
}

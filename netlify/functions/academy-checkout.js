const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Academy product prices in cents
const PRODUCT_PRICES = {
  "quantum-vision-boards": 9000,
  "becoming-present": 9000,
  "breaking-up-with-your-beliefs": 9000,
  "creative-mind-mapping": 9000,
  "power-of-the-question": 9000,
  "transformational-mastery": 36000,
};

// Stripe Price IDs
const STRIPE_PRICE_IDS = {
  "quantum-vision-boards": "price_1T2fTVFW5VdHdRjO5LAdRcU4",
  "becoming-present": "price_1T2fXLFW5VdHdRjOG7tA6XHF",
  "breaking-up-with-your-beliefs": "price_1T2fYbFW5VdHdRjO68dTOgxC",
  "creative-mind-mapping": "price_1T2fZUFW5VdHdRjOTrs22QqT",
  "power-of-the-question": "price_1T2faGFW5VdHdRjOYIj6Fvqd",
  "transformational-mastery": "price_1T2fb4FW5VdHdRjOS7qmZAjd",
};

const PRODUCT_NAMES = {
  "quantum-vision-boards": "Quantum Vision Boards: Unlocking Personal Potential",
  "becoming-present": "Becoming Present: Meditation for the Busy Mind",
  "breaking-up-with-your-beliefs": "Breaking Up with Your Beliefs",
  "creative-mind-mapping": "Creative Mind Mapping",
  "power-of-the-question": "The Power of The Question",
  "transformational-mastery": "Transformational Mastery Program (All 5 Courses)",
};

// Courses included in the bundle
const BUNDLE_COURSES = [
  "quantum-vision-boards",
  "becoming-present",
  "breaking-up-with-your-beliefs",
  "creative-mind-mapping",
  "power-of-the-question",
];

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
    const { productId, email, referralCode, applyCredits } = JSON.parse(event.body || "{}");

    if (!productId || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing productId or email" }) };
    }

    let basePrice = PRODUCT_PRICES[productId];
    if (!basePrice) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid product: " + productId }) };
    }

    // --- Prorated bundle upgrade pricing ---
    let bundleUpgradeApplied = false;
    let ownedCourseCount = 0;
    if (productId === "transformational-mastery" && email) {
      try {
        const { data: existingPurchases } = await supabase
          .from("purchases")
          .select("product_id")
          .eq("email", email.toLowerCase());
        if (existingPurchases) {
          const ownedCourses = existingPurchases
            .map(p => p.product_id)
            .filter(id => id && BUNDLE_COURSES.includes(id));
          ownedCourseCount = ownedCourses.length;
          if (ownedCourseCount > 0) {
            const amountPaidCents = ownedCourseCount * 9000; // $90 per course
            basePrice = Math.max(36000 - amountPaidCents, 0);
            bundleUpgradeApplied = true;
          }
        }
      } catch (e) {
        console.log("Bundle upgrade check error:", e.message);
      }
    }

    let discountAmount = 0;
    let referralDiscount = 0;
    let creditsToUse = 0;
    let validReferralCode = null;

    // --- Check for referral discount (10% off) ---
    if (referralCode) {
      const { data: refData } = await supabase
        .from("referral_codes")
        .select("email, code")
        .eq("code", referralCode.toUpperCase())
        .single();

      if (refData && refData.email.toLowerCase() !== email.toLowerCase()) {
        validReferralCode = referralCode.toUpperCase();
        referralDiscount = Math.round(basePrice * 0.10);
        discountAmount += referralDiscount;
      }
    }

    // --- Check for credit balance ---
    let availableCredits = 0;
    if (applyCredits) {
      const { data: creditData } = await supabase
        .from("referral_codes")
        .select("credit_balance")
        .eq("email", email.toLowerCase())
        .single();

      if (creditData && creditData.credit_balance > 0) {
        availableCredits = Math.round(creditData.credit_balance * 100);
      }
    }

    // Calculate final amount
    let priceAfterDiscounts = basePrice - referralDiscount;

    if (applyCredits && availableCredits > 0) {
      creditsToUse = Math.min(availableCredits, priceAfterDiscounts);
      discountAmount += creditsToUse;
    }

    const finalAmount = basePrice - discountAmount;

    console.log("Academy checkout calculation:", {
      email, productId, basePrice, referralDiscount,
      creditsToUse, finalAmount, validReferralCode
    });

    const isBundle = productId === "transformational-mastery";
    const siteUrl = process.env.URL || "https://qp-homepage.netlify.app";

    // --- If fully covered by credits, skip Stripe ---
    if (finalAmount <= 0) {
      const grantResult = await grantAccess(email, productId, {
        creditsUsed: creditsToUse / 100,
        referralCode: validReferralCode,
        referralDiscount: referralDiscount / 100
      });

      if (!grantResult.success) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: grantResult.error }) };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url: `${siteUrl}/academy/dashboard.html?session_id=credit-purchase-${Date.now()}&purchase=success`,
          creditPurchase: true,
          creditsUsed: creditsToUse / 100
        }),
      };
    }

    // --- Create Stripe checkout ---
    const sessionConfig = {
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url: `${siteUrl}/academy/dashboard.html?session_id={CHECKOUT_SESSION_ID}&purchase=success`,
      cancel_url: `${siteUrl}/academy/index.html#courses`,
      metadata: {
        productId,
        email,
        source: "academy",
        isBundle: isBundle ? "true" : "false",
        courseSlugs: isBundle ? BUNDLE_COURSES.join(",") : productId,
        referralCode: validReferralCode || "",
        creditsUsed: (creditsToUse / 100).toString(),
        referralDiscount: (referralDiscount / 100).toString(),
        originalPrice: (basePrice / 100).toString()
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: PRODUCT_NAMES[productId] || productId,
              description: buildDescription(productId, referralDiscount, creditsToUse, bundleUpgradeApplied, ownedCourseCount),
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        creditsUsed: creditsToUse / 100,
        referralDiscount: referralDiscount / 100,
        finalAmount: finalAmount / 100
      }),
    };

  } catch (err) {
    console.error("Academy checkout error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

// Grant access directly (for credit-only purchases)
async function grantAccess(email, productId, details) {
  try {
    const eventId = `credit-purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const isBundle = productId === "transformational-mastery";
    const products = isBundle
      ? ["transformational-mastery", ...BUNDLE_COURSES]
      : [productId];

    for (const pid of products) {
      await supabase.from("purchases").upsert({
        email: email.toLowerCase(),
        product_id: pid,
        stripe_event_id: `${eventId}-${pid}`,
        amount_paid: 0,
        referral_code_used: details.referralCode || null,
        purchased_at: new Date().toISOString()
      }, { onConflict: "stripe_event_id" });
    }

    // Also grant access in qa_enrollments
    await grantAcademyAccess(email, productId);

    // Deduct credits
    if (details.creditsUsed > 0) {
      const { data: current } = await supabase
        .from("referral_codes")
        .select("credit_balance")
        .eq("email", email.toLowerCase())
        .single();

      if (current) {
        const newBalance = Math.max(0, current.credit_balance - details.creditsUsed);
        await supabase.from("referral_codes")
          .update({ credit_balance: newBalance })
          .eq("email", email.toLowerCase());

        await supabase.from("credit_history").insert({
          email: email.toLowerCase(),
          amount: -details.creditsUsed,
          type: "purchase",
          description: `Used for ${PRODUCT_NAMES[productId] || productId}`,
          created_at: new Date().toISOString()
        });
      }
    }

    // Credit the referrer
    if (details.referralCode) {
      const rewardAmount = isBundle ? 25 : 10;
      const { data: referrer } = await supabase
        .from("referral_codes")
        .select("email, credit_balance, total_earned, successful_referrals")
        .eq("code", details.referralCode)
        .single();

      if (referrer) {
        await supabase.from("referral_codes")
          .update({
            credit_balance: (referrer.credit_balance || 0) + rewardAmount,
            total_earned: (referrer.total_earned || 0) + rewardAmount,
            successful_referrals: (referrer.successful_referrals || 0) + 1
          })
          .eq("code", details.referralCode);

        await supabase.from("credit_history").insert({
          email: referrer.email,
          amount: rewardAmount,
          type: "referral",
          description: `Referral reward: ${email} purchased ${PRODUCT_NAMES[productId] || productId}`,
          created_at: new Date().toISOString()
        });
      }
    }

    // Generate referral code for buyer if needed
    const { data: existingCode } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("email", email.toLowerCase())
      .single();

    if (!existingCode) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newCode = "";
      for (let i = 0; i < 8; i++) newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      await supabase.from("referral_codes").insert({
        email: email.toLowerCase(),
        code: newCode,
        credit_balance: 0,
        total_earned: 0,
        successful_referrals: 0
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Grant access error:", err);
    return { success: false, error: err.message };
  }
}

// Grant access in the academy enrollment tables
async function grantAcademyAccess(email, productId) {
  try {
    const isBundle = productId === "transformational-mastery";
    const courseSlugs = isBundle ? BUNDLE_COURSES : [productId];

    // Find user by email in auth
    const { data: profiles } = await supabase
      .from("qa_profiles")
      .select("id")
      .eq("email", email.toLowerCase());

    let userId = profiles && profiles.length > 0 ? profiles[0].id : null;

    if (!userId) {
      console.log("No qa_profile found for", email, "- enrollment will happen on first login");
      return;
    }

    // Get course IDs
    const { data: courses } = await supabase
      .from("qa_courses")
      .select("id, slug")
      .in("slug", courseSlugs);

    if (!courses || courses.length === 0) {
      console.log("No courses found for slugs:", courseSlugs);
      return;
    }

    // Create enrollments
    for (const course of courses) {
      await supabase.from("qa_enrollments").upsert({
        user_id: userId,
        course_id: course.id,
        status: "active",
        enrolled_at: new Date().toISOString()
      }, { onConflict: "user_id,course_id" });
      console.log("✅ Enrolled", email, "in", course.slug);
    }
  } catch (err) {
    console.error("Academy access grant error:", err);
  }
}

function buildDescription(productId, referralDiscount, creditsUsed, bundleUpgrade, ownedCount) {
  const parts = [];
  if (productId === "transformational-mastery" && bundleUpgrade) {
    parts.push(`Bundle upgrade (${ownedCount} courses owned, paying difference)`);
  } else if (productId === "transformational-mastery") {
    parts.push("All 5 Self-H.O.P.E. Academy Courses");
  }
  if (referralDiscount > 0) parts.push(`Referral discount: -$${(referralDiscount / 100).toFixed(2)}`);
  if (creditsUsed > 0) parts.push(`Credits applied: -$${(creditsUsed / 100).toFixed(2)}`);
  return parts.join(" • ") || undefined;
}

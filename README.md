# Quantum Physician — quantumphysician.com

Main hub for Dr. Tracey Clark's holistic healthcare practice.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript (static, hosted on Netlify)
- **Database & Auth:** Supabase (shared with Fusion Sessions)
- **Payments:** Stripe (shared account)
- **Video Hosting:** Vimeo (domain-restricted)
- **Hosting:** Netlify

## Project Structure
```
quantum-physician/
├── index.html              # Homepage
├── pages/                  # Additional pages (about, courses, dashboard, etc.)
├── assets/
│   ├── images/             # All image assets
│   └── videos/             # Background videos
├── css/                    # Shared stylesheets (future)
├── js/                     # Shared scripts (future)
├── netlify/
│   └── functions/          # Serverless functions (Stripe webhooks, etc.)
├── netlify.toml            # Netlify config
└── .env                    # Environment variables (not committed)
```

## Staging vs Production
- **Staging:** quantum-physician-staging.netlify.app (current)
- **Production:** quantumphysician.com (DNS switch at launch)
- No code changes needed between staging and production

## Shared Infrastructure with Fusion Sessions
- Same Supabase project (shared users, referrals, achievements)
- Same Stripe account (separate products)
- Users log in once, access both platforms

## Environment Variables (set in Netlify dashboard)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Local Development
Just open index.html in a browser. For functions, use `netlify dev`.

## Launch Checklist
- [ ] Add quantumphysician.com domain in Netlify
- [ ] Update DNS records
- [ ] Add production URL to Supabase Auth allowed redirects
- [ ] Update Supabase Auth "Site URL" to quantumphysician.com
- [ ] Add production Stripe webhook endpoint
- [ ] Test login/signup flow on production domain
- [ ] SSL certificate auto-provisions via Netlify

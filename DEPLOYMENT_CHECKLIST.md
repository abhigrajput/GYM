# IronIQ Deployment Checklist

## Before First Deploy
- [ ] Fill all values in .env.local
- [ ] Run: npm run db:deploy (deploys schema to Supabase)
- [ ] Run: npm run db:setup-storage (creates storage buckets)
- [ ] Run: npm run icons:generate (generates PWA icons)
- [ ] Push to GitHub

## Vercel Setup
- [ ] Import GitHub repo in Vercel
- [ ] Set region: bom1 (Mumbai)
- [ ] Add all env variables:
      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY
      SUPABASE_SERVICE_ROLE_KEY
      ANTHROPIC_API_KEY
      NEXT_PUBLIC_RAZORPAY_KEY_ID
      RAZORPAY_KEY_SECRET
      NEXT_PUBLIC_APP_URL (https://ironiq.in or your vercel URL)
      QR_HMAC_SECRET (generate: openssl rand -hex 32)
- [ ] Deploy
- [ ] Test live URL

## After Deploy — Verify These URLs Work
- [ ] https://ironiq.in — landing page loads
- [ ] https://ironiq.in/manifest.json — returns JSON
- [ ] https://ironiq.in/api/health — returns {"status":"ok"}
- [ ] https://ironiq.in/.well-known/assetlinks.json — returns JSON
- [ ] https://ironiq.in/privacy — loads
- [ ] https://ironiq.in/terms — loads
- [ ] https://ironiq.in/login — loads
- [ ] https://ironiq.in/signup — loads

## Supabase Dashboard Checks
- [ ] Authentication → Email enabled
- [ ] Authentication → Site URL set to https://ironiq.in
- [ ] Authentication → Redirect URLs: https://ironiq.in/auth/callback
- [ ] Storage → progress-photos bucket exists
- [ ] Storage → equipment-scans bucket exists
- [ ] Database → All tables exist (profiles, gyms, equipment, members, etc.)
- [ ] Database → RLS enabled on all tables

## Play Store (After Vercel Deploy)
- [ ] Go to pwabuilder.com → enter live URL
- [ ] Score must be 95+ 
- [ ] Download Android package
- [ ] Create Play Console account ($25)
- [ ] Upload AAB
- [ ] Add SHA-256 to assetlinks.json → redeploy
- [ ] Fill store listing (screenshots, description)
- [ ] Submit for review

## Razorpay
- [ ] Create account at razorpay.com
- [ ] Complete KYC
- [ ] Get live API keys
- [ ] Update .env in Vercel with live keys
- [ ] Test a ₹1 payment

## Custom Domain (ironiq.in)
- [ ] Buy domain at GoDaddy/Namecheap (ironiq.in — check availability)
- [ ] In Vercel: Settings → Domains → Add ironiq.in
- [ ] Add DNS records as shown by Vercel
- [ ] Wait for SSL (auto, ~5 min)

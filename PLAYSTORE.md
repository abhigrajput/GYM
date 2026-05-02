# Play Store Deployment Guide for IronIQ

## Method: PWA via Bubblewrap / PWA Builder (Free, No native code needed)

### Step 1 — Deploy to Vercel
- Must be live HTTPS URL
- Verify manifest.json loads at /manifest.json
- Verify service worker registers

### Step 2 — PWA Builder
- Go to pwabuilder.com
- Enter: https://ironiq.in
- Score must be 100/100 (our setup achieves this)
- Download: Android package (Bubblewrap/TWA)

### Step 3 — Google Play Console
- Create account: $25 one-time fee
- Create new app: in.ironiq.app
- Upload the AAB file from PWA Builder
- Fill: App name "IronIQ", Category "Health & Fitness"
- Screenshots: 2 phone + 1 tablet (minimum)
- Privacy policy URL required: /privacy

### Step 4 — Asset Links
- Get SHA-256 from Play Console → App Signing
- Replace in public/.well-known/assetlinks.json
- Redeploy to Vercel

### Step 5 — Review
- Internal testing first (add test emails)
- Submit for review (3-7 days)
- Once approved: Production release

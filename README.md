# D-Money Beats Website

Production source for dmoneybeats.com.

## Current build
- Responsive cyberpunk/rain site with fog replay intro, layered rain, cloud drift, lightning, lens moisture, traffic motion and static red “Bangers Only” treatment.
- Nine 60-second MP3 preview files are prepared from the private WAV masters. Full masters are intentionally not stored in this public repository.
- Beat player, favorites/save-for-later, updated licensing tiers, bundles, mixing/mastering services, email-only free-beat funnel, contact flow, SEO metadata and legal pages.
- Cloudflare Pages Functions scaffolding for Stripe-hosted Checkout and form forwarding.

## Approved pricing
- MP3 $29.99
- WAV $49.99
- Trackouts $99.99
- Unlimited $199.99
- Exclusive: request a quote
- 3 MP3 bundle $69.99
- 3 WAV bundle $119.99
- Mixing $99.99
- Mastering $49.99
- Mix + Master $129.99

## Required Cloudflare environment variables
Set secrets/variables in the Cloudflare Pages project before enabling live checkout:
- `STRIPE_SECRET_KEY`
- `PRICE_MP3`
- `PRICE_WAV`
- `PRICE_TRACKOUTS`
- `PRICE_UNLIMITED`
- `PRICE_BUNDLE_MP3_3`
- `PRICE_BUNDLE_WAV_3`
- `PRICE_MIXING`
- `PRICE_MASTERING`
- `PRICE_MIX_MASTER`
- `EMAIL_CAPTURE_WEBHOOK`
- `CONTACT_WEBHOOK`

Protected paid files should live outside this public repository (for example, Cloudflare R2) and be released only after payment verification. Add Stripe webhook + protected fulfillment before final sales launch. Public preview audio/image assets are prepared locally and still need binary asset sync into the deployment source.
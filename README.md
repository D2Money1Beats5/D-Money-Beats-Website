# D-Money Beats Website

Production source for dmoneybeats.com.

## Current build
- Responsive cyberpunk/rain site with fog replay intro, layered rain, cloud drift, lightning, lens moisture, traffic motion and static red “Bangers Only” treatment.
- Nine 60-second preview paths are wired into the player. Full masters are intentionally not stored in this public repository.
- Beat player, favorites/save-for-later, licensing tiers, bundles, mixing/mastering services, email-only free-use beat card, contact flow, SEO metadata and legal pages.
- Cloudflare Pages Functions for Stripe-hosted Checkout, server-side payment verification, order-specific agreement generation, and protected fulfillment lookup.
- Checkout pricing is enforced server-side; customers cannot submit their own amount from the browser.

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

## Purchase flow
D-Money Beats → Select license/service → Stripe Checkout → Stripe-verified successful payment → Stripe receipt + order-specific agreement + matching protected files → download confirmation.

The success page does not trust the checkout redirect alone. `/api/verify-session` retrieves the Checkout Session from Stripe and releases fulfillment data only when the session is complete and payment status is paid. `/api/order-agreement` independently verifies the same paid session before generating the downloadable order-specific agreement/service record.

## Required Cloudflare environment variables
- `STRIPE_SECRET_KEY` — live Stripe secret key used only in Pages Functions.
- `DELIVERY_MANIFEST_JSON` — protected delivery manifest used after payment verification.
- `EMAIL_CAPTURE_WEBHOOK` — destination for free-use beat email capture.
- `CONTACT_WEBHOOK` — destination for contact-form requests.

### DELIVERY_MANIFEST_JSON shape
Keep full masters outside this public repository (Cloudflare R2 or another protected storage layer). The manifest may use the beat title or slug as its key. Each tier can contain one URL, an array of URLs, or objects with `label` and `url`.

```json
{
  "what-a-time": {
    "mp3": [{"label":"What A Time — MP3","url":"PROTECTED_OR_EXPIRING_URL"}],
    "wav": [
      {"label":"What A Time — WAV","url":"PROTECTED_OR_EXPIRING_URL"},
      {"label":"What A Time — MP3","url":"PROTECTED_OR_EXPIRING_URL"}
    ],
    "trackouts": [{"label":"What A Time — Trackouts ZIP","url":"PROTECTED_OR_EXPIRING_URL"}],
    "unlimited": [{"label":"What A Time — Full package","url":"PROTECTED_OR_EXPIRING_URL"}]
  }
}
```

## Launch blockers
- Sync the public preview audio and hero image assets into the deployment source if they are not already present in the live Cloudflare project.
- Upload/protect the paid MP3/WAV/stem masters and set `DELIVERY_MANIFEST_JSON`.
- Confirm `STRIPE_SECRET_KEY`, `EMAIL_CAPTURE_WEBHOOK`, and `CONTACT_WEBHOOK` are configured in Cloudflare.
- Run one real or controlled live Checkout purchase and verify receipt, agreement, correct files, and download confirmation end-to-end before public promotion.
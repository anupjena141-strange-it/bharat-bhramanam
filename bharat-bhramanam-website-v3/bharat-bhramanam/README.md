# Bharat Bhramanam

Interactive relief map of India: 208 places across all 36 states & UTs, open-licence best-season photos, and a trip planner. Free to explore, with Premium unlocked by a ₹499 one-time payment.

## Folder layout
| Path | What it is | Public? |
|---|---|---|
| `public/` | The website: map, pages, fonts, icons, policy pages, `config.js` | Yes |
| `netlify/functions/` | Secure server endpoints: `/api/premium`, `/api/create-order`, `/api/verify-payment`, `/api/razorpay-webhook` | No, runs on Netlify |
| `netlify/lib/` | Shared server code and the Premium travel data (bundled into the functions only) | No |
| `supabase/schema.sql` | Accounts table with row-level security | Run once in Supabase |
| `SETUP.md` | Step-by-step go-live guide | |
| `SECURITY.md` | What's protected and how | |

## Free vs Premium
- **Free:**
  - Map, filters, distances from all state capitals and open-licence photos.
  - Place overview: about, best months, getting there, suggested days.
  - Visited and wishlist marks.
- **Premium (₹499, one-time):**
  - Permits and closures ("know before you go"), what to carry, traveller tips and videos, live weather.
  - Trip planner: calendar, reminders, route & day plan, packing list.
  - Own photos and notes, adding your own places, backup, privacy lock.

Premium travel data is not in the public files; the server sends it only to paid accounts. Planner tools are unlocked in the browser once the server confirms payment.

## Paywall off / on
Netlify variable `PAYWALL_ENABLED`:
- `false`: everything is free for everyone. Use this until payments are approved.
- `true`: Free vs Premium applies.

Go-live steps: see **SETUP.md**.

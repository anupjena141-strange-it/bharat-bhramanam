# Security design: Bharat Bhramanam

## Accounts and payments
| Risk | Protection |
|---|---|
| Stolen passwords | Passwords are handled only by Supabase Auth (hashed server-side). The site never stores or sees them after login. Email confirmation is required. |
| Faking a payment in the browser | Premium is unlocked only by the server. `/api/verify-payment` checks Razorpay's HMAC-SHA256 signature (constant-time comparison), then asks Razorpay directly that the payment is captured, is for exactly ₹499 in INR, belongs to that order, and that the order was created for that user. A signed webhook is the backup path. |
| Editing your own "paid" flag | Row-level security: users can only read their own row, and nobody can write from the browser. Only the server's secret service key can mark a user paid. |
| Copying Premium content without paying | The Premium travel data lives inside the server functions, not the public website. `/api/premium` returns it only when a valid login token and a paid flag are both present. |
| Card or UPI data exposure | Payment details are entered only in Razorpay's own secure window. This site never receives them. |
| Leaked secrets | Secret keys live only in Netlify environment variables. `public/config.js` holds only public values (Supabase URL and anon key). |

## Website hardening
| Risk | Protection |
|---|---|
| Injected scripts (XSS) | Strict Content Security Policy (`default-src 'none'`); scripts only from this site and Razorpay Checkout; no inline scripts or `eval`. All text is escaped, and all stored, imported and server data is validated field by field. Tested with injection payloads. |
| Clickjacking | `frame-ancestors 'none'`, `X-Frame-Options: DENY`, plus a script fallback. |
| Network snooping | HTTPS only (HSTS 2 years, `upgrade-insecure-requests`), `Referrer-Policy: no-referrer`, `nosniff`. |
| Someone using your device | Optional passcode lock: PBKDF2-SHA256 (310,000 iterations) to AES-256-GCM encryption of trips, notes and photos on the device, with auto-lock. |
| Supply-chain tampering | d3, topojson and fonts are bundled locally (`npm audit`: 0 issues). The only outside code is Razorpay Checkout, loaded only when you press Pay. |

## Outside services contacted
- Supabase: login and the paid flag.
- Razorpay: payments, only while paying.
- Wikimedia Commons: photos (search text only).
- Open-Meteo: weather (place coordinates only; off when the paywall is on, unless you have a paid key).

No analytics, ads or tracking cookies.

## Limits
- A device already infected with malware can't be protected.
- A forgotten passcode can't be recovered.
- Anyone who has paid can copy what they see on screen.

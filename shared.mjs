# Bharat Bhramanam: going live with accounts and ₹499 payments

Total time: about 1 hour, plus Razorpay's KYC approval (usually 1–3 working days). Every service below has a free tier.

> **Never paste secret keys into chat, email or `config.js`.** Secrets go only into Netlify's environment variables (step 4).

## Before you start: check these first
- **Government service rules:** as a central government employee, CCS (Conduct) Rules, 1964, Rule 15(1) bars engaging in any trade or business without previous government sanction. Get written sanction through your office before switching payments on, or keep the site free. The site works fully with the paywall off.
- **Tax:** income from sales is taxable. GST registration is generally needed only above the turnover threshold. Ask a CA.
- **Weather:** Open-Meteo's free API is for non-commercial use only. When the paywall is on, live weather hides automatically unless you buy an Open-Meteo plan and put its key in `config.js`.

## 1. Put the code on GitHub (5 min)
1. Create a free account at github.com, then **New repository** → name it `bharat-bhramanam` → **Private** → Create.
2. Click **uploading an existing file** and drag in *everything inside* this folder (`public/`, `netlify/`, `supabase/`, `netlify.toml`, the .md files) → **Commit changes**.

## 2. Supabase: accounts and database (15 min)
1. Go to supabase.com → **New project**, choose region **Mumbai (ap-south-1)** and a strong database password.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email**: keep it enabled, and keep **Confirm email** on.
4. **Authentication → URL Configuration**: set **Site URL** to your site address (from step 4, e.g. `https://bharat-bhramanam.netlify.app`) and add it under **Redirect URLs**.
5. **Project Settings → API**: copy the **Project URL**, the **anon public** key and the **service_role** key. The service_role key is secret.
6. Open `public/config.js` on GitHub (pencil icon) and fill in `SUPABASE_URL` and `SUPABASE_ANON_KEY`. These two are safe to publish. Commit.

## 3. Razorpay: payments (15 min + KYC)
1. Sign up at razorpay.com and complete KYC (PAN, bank account, and website URL = your Netlify address).
   Razorpay checks that the site has these pages, which are already built in: Terms, Privacy, Refunds & Cancellation, Shipping & Delivery, Pricing, Contact. First send me your name, support email, phone and address, and I'll fill them in.
2. **Account & Settings → API Keys → Generate key**: you get a **Key ID** (`rzp_test_…` first, `rzp_live_…` after activation) and a **Key Secret** (secret).
3. **Account & Settings → Webhooks → Add**:
   - URL: `https://YOUR-SITE/api/razorpay-webhook`
   - Events: `payment.captured` and `order.paid`
   - Secret: invent a long random string and note it down.
4. **Settings → Payment capture**: set it to **Automatic**.

## 4. Netlify: hosting and the secure server functions (10 min)
1. netlify.com → **Add new site → Import an existing project → GitHub** → pick `bharat-bhramanam`. Netlify reads `netlify.toml` automatically → **Deploy**.
2. **Site configuration → Change site name** → `bharat-bhramanam`.
3. **Site configuration → Environment variables → Add** each of these. Mark the secret ones as **Secret**.

| Variable | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**secret**) |
| `RAZORPAY_KEY_ID` | `rzp_test_…` (later `rzp_live_…`) |
| `RAZORPAY_KEY_SECRET` | Key Secret (**secret**) |
| `RAZORPAY_WEBHOOK_SECRET` | the webhook secret you invented (**secret**) |
| `PRICE_INR` | `499` |
| `PAYWALL_ENABLED` | `false` for now, and `true` when you're ready to charge |

4. **Deploys → Trigger deploy** so the variables take effect.

## 5. Test with Razorpay test mode, then go live
1. Set `PAYWALL_ENABLED` = `true` and redeploy.
2. Open the site → **Log in → Create account** → confirm the email → **Unlock** → pay with Razorpay's test card or UPI (see "Test card details" in the Razorpay docs).
3. Premium should unlock within seconds. In Supabase **Table editor → profiles**, `paid` = true.
4. Once Razorpay activates your account: swap in the `rzp_live_…` key and secret, redeploy, and you're live.

**Free Premium for yourself:** register on your own site, then run this in the Supabase SQL editor:
`update public.profiles set paid = true, paid_at = now() where email = 'your@email';`

**Refunds:** refund from the Razorpay dashboard, then set `paid = false` for that user in Supabase.

## Custom domain (optional)
Buy `bharatbhramanam.in` (or `.com`) → Netlify **Domain management → Add domain** → follow the DNS steps. Then update the Supabase Site URL, the Razorpay website and the webhook URL to the new domain.

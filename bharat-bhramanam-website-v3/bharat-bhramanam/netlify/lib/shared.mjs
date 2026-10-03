// Shared helpers for the Bharat Bhramanam API (Netlify Functions, Node 18+). No third-party packages.
import crypto from "node:crypto";

export const env = k => (process.env[k] || "").trim();
export const paywallOn = () => env("PAYWALL_ENABLED") === "true";
export const pricePaise = () => Math.round(Math.max(1, Number(env("PRICE_INR") || 499)) * 100);

export function json(status, body){
  return new Response(JSON.stringify(body), { status, headers: {
    "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" } });
}

// Verifies the Supabase access token by asking Supabase who it belongs to.
export async function getUser(req){
  const m = /^Bearer\s+([A-Za-z0-9._-]{20,4096})$/.exec(req.headers.get("authorization") || "");
  if(!m || !env("SUPABASE_URL")) return null;
  const r = await fetch(`${env("SUPABASE_URL")}/auth/v1/user`, { headers: { apikey: env("SUPABASE_ANON_KEY"), authorization: `Bearer ${m[1]}` } });
  if(!r.ok) return null;
  const u = await r.json().catch(() => null);
  return u && typeof u.id === "string" && /^[0-9a-f-]{36}$/.test(u.id) ? u : null;
}

const svc = () => ({ apikey: env("SUPABASE_SERVICE_ROLE_KEY"), authorization: `Bearer ${env("SUPABASE_SERVICE_ROLE_KEY")}`, "content-type": "application/json" });

export async function getProfile(uid){
  const r = await fetch(`${env("SUPABASE_URL")}/rest/v1/profiles?id=eq.${encodeURIComponent(uid)}&select=id,paid,paid_at`, { headers: svc() });
  if(!r.ok) throw new Error("profile lookup failed");
  const rows = await r.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

// Idempotent: upsert keeps working if the signup trigger never created the row.
export async function markPaid(uid, email, pay){
  const row = { id: uid, email: email || null, paid: true, paid_at: new Date().toISOString(),
    razorpay_order_id: pay.order_id, razorpay_payment_id: pay.payment_id, amount_paise: pay.amount };
  const r = await fetch(`${env("SUPABASE_URL")}/rest/v1/profiles?on_conflict=id`, {
    method: "POST", headers: { ...svc(), prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row) });
  if(!r.ok) throw new Error("could not save payment");
}

export function rzp(path, init = {}){
  const auth = Buffer.from(`${env("RAZORPAY_KEY_ID")}:${env("RAZORPAY_KEY_SECRET")}`).toString("base64");
  return fetch(`https://api.razorpay.com/v1${path}`, { ...init, headers: { authorization: `Basic ${auth}`, "content-type": "application/json", ...(init.headers || {}) } });
}

export const hmacHex = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");
export function safeEqualHex(a, b){
  if(typeof a !== "string" || typeof b !== "string" || !/^[0-9a-f]+$/i.test(a) || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
export const ORDER_RE = /^order_[A-Za-z0-9]{6,40}$/, PAY_RE = /^pay_[A-Za-z0-9]{6,40}$/;

// Confirms a Razorpay payment really belongs to this order/user and is for the right amount, capturing it if needed.
export async function confirmPayment(orderId, paymentId, expectUserId){
  const [or, pr] = await Promise.all([rzp(`/orders/${orderId}`), rzp(`/payments/${paymentId}`)]);
  if(!or.ok || !pr.ok) return { ok:false, reason:"lookup" };
  const order = await or.json(), pay = await pr.json();
  const uid = order.notes && order.notes.user_id;
  if(pay.order_id !== orderId || order.amount !== pricePaise() || order.currency !== "INR" || pay.amount !== order.amount) return { ok:false, reason:"mismatch" };
  if(expectUserId && uid !== expectUserId) return { ok:false, reason:"user" };
  if(pay.status === "authorized"){
    const cr = await rzp(`/payments/${paymentId}/capture`, { method: "POST", body: JSON.stringify({ amount: pay.amount, currency: "INR" }) });
    if(!cr.ok) return { ok:false, reason:"capture" };
  } else if(pay.status !== "captured") return { ok:false, reason:"status" };
  return { ok:true, uid, email: order.notes && order.notes.email, amount: pay.amount };
}

// POST /api/razorpay-webhook: backup path that unlocks Premium even if the buyer closes the page right after paying.
import { env, json, markPaid, hmacHex, safeEqualHex, confirmPayment, ORDER_RE, PAY_RE } from "../lib/shared.mjs";

export default async (req) => {
  if(req.method !== "POST") return json(405, { error: "Method not allowed" });
  const raw = await req.text();
  if(raw.length > 200000) return json(413, { error: "Too large" });
  const sig = req.headers.get("x-razorpay-signature") || "";
  if(!env("RAZORPAY_WEBHOOK_SECRET") || !safeEqualHex(hmacHex(env("RAZORPAY_WEBHOOK_SECRET"), raw), sig)) return json(400, { error: "Bad signature" });
  let evt; try { evt = JSON.parse(raw); } catch(e){ return json(400, { error: "Bad JSON" }); }
  if(!["payment.captured", "order.paid"].includes(evt.event)) return json(200, { ignored: true });
  const pay = evt.payload && evt.payload.payment && evt.payload.payment.entity;
  if(!pay || !PAY_RE.test(pay.id || "") || !ORDER_RE.test(pay.order_id || "")) return json(200, { ignored: true });
  try {
    const c = await confirmPayment(pay.order_id, pay.id, null);
    if(!c.ok || !/^[0-9a-f-]{36}$/.test(c.uid || "")) return json(200, { ignored: true });
    await markPaid(c.uid, c.email, { order_id: pay.order_id, payment_id: pay.id, amount: c.amount });
    return json(200, { ok: true });
  } catch(e){ return json(500, { error: "retry" }); }
};
export const config = { path: "/api/razorpay-webhook" };

// POST /api/verify-payment: checks Razorpay's signature, re-confirms the payment with Razorpay, then unlocks Premium.
import { env, json, getUser, markPaid, hmacHex, safeEqualHex, confirmPayment, ORDER_RE, PAY_RE } from "../lib/shared.mjs";

export default async (req) => {
  if(req.method !== "POST") return json(405, { error: "Method not allowed" });
  const user = await getUser(req);
  if(!user) return json(401, { error: "Please log in first" });
  let b; try { b = await req.json(); } catch(e){ return json(400, { error: "Bad request" }); }
  const orderId = b && b.razorpay_order_id, paymentId = b && b.razorpay_payment_id, sig = b && b.razorpay_signature;
  if(!ORDER_RE.test(orderId || "") || !PAY_RE.test(paymentId || "") || !/^[0-9a-f]{64}$/i.test(sig || "")) return json(400, { error: "Bad request" });
  if(!safeEqualHex(hmacHex(env("RAZORPAY_KEY_SECRET"), `${orderId}|${paymentId}`), sig)) return json(400, { error: "Signature check failed" });
  try {
    const c = await confirmPayment(orderId, paymentId, user.id);
    if(!c.ok) return json(c.reason === "lookup" || c.reason === "capture" ? 502 : 400, { error: "Payment could not be confirmed" });
    await markPaid(user.id, user.email, { order_id: orderId, payment_id: paymentId, amount: c.amount });
    return json(200, { paid: true });
  } catch(e){ return json(502, { error: "Please try again in a moment" }); }
};
export const config = { path: "/api/verify-payment" };

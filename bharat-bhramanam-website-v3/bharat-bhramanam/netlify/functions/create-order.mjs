// POST /api/create-order: creates a Razorpay order for the logged-in user.
import { env, json, paywallOn, pricePaise, getUser, getProfile, rzp } from "../lib/shared.mjs";

export default async (req) => {
  if(req.method !== "POST") return json(405, { error: "Method not allowed" });
  if(!paywallOn() || !env("RAZORPAY_KEY_ID") || !env("RAZORPAY_KEY_SECRET")) return json(503, { error: "Payments are not switched on yet" });
  const user = await getUser(req);
  if(!user) return json(401, { error: "Please log in first" });
  try {
    const prof = await getProfile(user.id);
    if(prof && prof.paid) return json(409, { error: "You already have Premium", paid: true });
    const r = await rzp("/orders", { method: "POST", body: JSON.stringify({
      amount: pricePaise(), currency: "INR", receipt: `bb_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, email: String(user.email || "").slice(0, 200), product: "bharat-bhramanam-premium" } }) });
    if(!r.ok) return json(502, { error: "The payment service is busy. Please try again." });
    const o = await r.json();
    return json(200, { order_id: o.id, amount: o.amount, currency: o.currency, key_id: env("RAZORPAY_KEY_ID") });
  } catch(e){ return json(500, { error: "Something went wrong. Please try again." }); }
};
export const config = { path: "/api/create-order" };

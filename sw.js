// GET /api/premium: returns the premium travel data only to paid users (or to everyone while the paywall is off).
import { json, paywallOn, pricePaise, getUser, getProfile } from "../lib/shared.mjs";
import PREMIUM from "../lib/premium-data.mjs";

export default async (req) => {
  if(req.method !== "GET") return json(405, { error: "Method not allowed" });
  if(!paywallOn()) return json(200, { paywall: false, paid: true, data: PREMIUM });
  const user = await getUser(req);
  if(!user) return json(401, { paywall: true, loggedIn: false, price: pricePaise() / 100 });
  try {
    const prof = await getProfile(user.id);
    if(!prof || !prof.paid) return json(402, { paywall: true, loggedIn: true, paid: false, price: pricePaise() / 100 });
    return json(200, { paywall: true, paid: true, data: PREMIUM });
  } catch(e){ return json(503, { error: "Please try again in a moment" }); }
};
export const config = { path: "/api/premium" };

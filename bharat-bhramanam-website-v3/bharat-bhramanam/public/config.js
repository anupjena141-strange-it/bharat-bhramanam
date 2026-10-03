// Public settings. Safe to publish: the anon key only works together with the database's row-level security.
// Fill these in after creating your Supabase project (see SETUP.md). NEVER put secret keys here.
window.BB_CONFIG = {
  SUPABASE_URL: "",          // e.g. "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "",     // Supabase → Project Settings → API → anon public key
  PRICE_INR: 499,            // shown on the site; the server's PRICE_INR is what's actually charged
  OPEN_METEO_API_KEY: ""     // optional: needed to keep live weather once you charge money (Open-Meteo commercial plan)
};

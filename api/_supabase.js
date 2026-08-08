const { createClient } = require("@supabase/supabase-js");

// Server-side only: uses the service role key, so it bypasses RLS.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set as env vars in Vercel.
function getServiceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

module.exports = { getServiceClient };

const { getServiceClient } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const { id } = body;

    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    const supabase = getServiceClient();
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("page_sessions")
      .select("id, checkout_clicks, first_checkout_click_at")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("page_sessions")
        .update({
          checkout_clicks: existing.checkout_clicks + 1,
          first_checkout_click_at: existing.first_checkout_click_at || now,
          last_checkout_click_at: now,
          updated_at: now,
        })
        .eq("id", id);
    } else {
      await supabase.from("page_sessions").insert({
        id,
        checkout_clicks: 1,
        first_checkout_click_at: now,
        last_checkout_click_at: now,
        first_seen_at: now,
        last_seen_at: now,
      });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
};

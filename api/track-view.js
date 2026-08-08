const { getServiceClient } = require("./_supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const { id, referrer, landing_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;

    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }

    const supabase = getServiceClient();
    const now = new Date().toISOString();
    const userAgent = req.headers["user-agent"] || null;

    const { data: existing } = await supabase
      .from("page_sessions")
      .select("id, views")
      .eq("id", id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("page_sessions")
        .update({
          views: existing.views + 1,
          last_seen_at: now,
          updated_at: now,
        })
        .eq("id", id);
    } else {
      await supabase.from("page_sessions").insert({
        id,
        referrer: referrer || null,
        landing_url: landing_url || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        user_agent: userAgent,
        first_seen_at: now,
        last_seen_at: now,
      });
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
};

import { getSupabaseServer } from "@/lib/supabase";

export default async function Page() {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return (
      <div>Supabase not configured. Set SUPABASE keys to use admin UI.</div>
    );
  }

  const { data } = await supabase
    .from("prompt_options")
    .select("id, field, label, value, option_type, sort_order, created_at")
    .order("field")
    .order("sort_order");

  const rows = data || [];

  return (
    <div style={{ padding: 24 }}>
      <h1>Prompt Options (admin)</h1>
      <p>Review generated options and delete duplicates or unwanted items.</p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Field</th>
            <th style={{ textAlign: "left", padding: 8 }}>Label</th>
            <th style={{ textAlign: "left", padding: 8 }}>Value</th>
            <th style={{ textAlign: "left", padding: 8 }}>Type</th>
            <th style={{ textAlign: "left", padding: 8 }}>Created</th>
            <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{r.field}</td>
              <td style={{ padding: 8 }}>{r.label}</td>
              <td style={{ padding: 8 }}>{r.value}</td>
              <td style={{ padding: 8 }}>{r.option_type}</td>
              <td style={{ padding: 8 }}>
                {new Date(r.created_at).toLocaleString()}
              </td>
              <td style={{ padding: 8 }}>
                <form method="post" action="/api/options/delete">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

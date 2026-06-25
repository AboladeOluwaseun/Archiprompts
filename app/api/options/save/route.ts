import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ inserted: 0 });
  }

  try {
    const body = await req.json();
    const field: string = body.field;
    const items: Array<{ label: string; value: string; option_type?: string }> =
      body.items || [];

    if (!field || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // check existing values to avoid duplicates
    const values = items.map((i) => i.value);
    const { data: existing, error: selectError } = await supabase
      .from("prompt_options")
      .select("value")
      .in("value", values)
      .eq("field", field);

    if (selectError) {
      console.warn("/api/options/save warning", selectError);
      return NextResponse.json({ inserted: 0 });
    }

    const existingSet = new Set((existing || []).map((r: any) => r.value));
    const toInsert = items
      .filter((i) => !existingSet.has(i.value))
      .map((i) => ({
        field,
        label: i.label,
        value: i.value,
        option_type: i.option_type || "select",
        sort_order: 0,
      }));

    if (toInsert.length === 0) {
      return NextResponse.json({ inserted: 0 });
    }

    const { error: insertError } = await supabase
      .from("prompt_options")
      .insert(toInsert);
    if (insertError) {
      console.warn("/api/options/save warning", insertError);
      return NextResponse.json({ inserted: 0 });
    }

    return NextResponse.json({ inserted: toInsert.length });
  } catch (err) {
    console.warn("/api/options/save warning", err);
    return NextResponse.json({ inserted: 0 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from("prompt_options")
      .select("id, field, label, value, option_type, sort_order, created_at")
      .order("field")
      .order("sort_order");

    if (error) {
      console.warn("/api/options/list warning", error);
      return NextResponse.json([]);
    }
    return NextResponse.json(data || []);
  } catch (err) {
    console.warn("/api/options/list warning", err);
    return NextResponse.json([]);
  }
}

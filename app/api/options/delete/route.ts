import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ deleted: 0 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("prompt_options")
      .delete()
      .eq("id", id);
    if (error) {
      console.warn("/api/options/delete warning", error);
      return NextResponse.json({ deleted: 0 });
    }
    return NextResponse.json({ deleted: 1 });
  } catch (err) {
    console.warn("/api/options/delete warning", err);
    return NextResponse.json({ deleted: 0 });
  }
}

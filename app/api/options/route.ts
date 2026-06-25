import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { DEFAULT_BUILDER_OPTIONS, BuilderOptions } from "@/lib/formOptions";

interface OptionRow {
  field: string;
  label: string;
  value: string;
  option_type: string;
  sort_order: number;
}

function applyDynamicOptions(rows: OptionRow[]): BuilderOptions {
  const result: BuilderOptions = { ...DEFAULT_BUILDER_OPTIONS };

  rows
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach((row) => {
      const key = row.field as keyof BuilderOptions;
      if (!Object.prototype.hasOwnProperty.call(result, key)) return;

      const target = result[key] as Array<{ label: string; value: string }>;
      target.push({ label: row.label, value: row.value });
    });

  return result;
}

export async function GET() {
  const sb = getSupabaseServer();
  if (!sb) {
    return NextResponse.json(DEFAULT_BUILDER_OPTIONS);
  }

  const { data, error } = await sb
    .from<OptionRow>("prompt_options")
    .select("field,label,value,option_type,sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return NextResponse.json(DEFAULT_BUILDER_OPTIONS);
  }

  return NextResponse.json(applyDynamicOptions(data));
}

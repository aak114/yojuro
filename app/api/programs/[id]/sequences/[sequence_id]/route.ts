import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Sequence } from "@/types/types";

// GET - Fetch sequence by ID
export async function GET({ params }: { params: { sequence_id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sequences")
    .select("*")
    .eq("sequence_id", params.sequence_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// PATCH - Update a sequence
export async function PATCH(req: Request, { params }: { params: { sequence_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Partial<Sequence> = await req.json();
  const { sequence_dates } = body;

  const { data, error } = await supabase
    .from("sequences")
    .update({ sequence_dates })
    .eq("sequence_id", params.sequence_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

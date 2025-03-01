import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Sequence } from "@/types/types";

// GET all sequences for a specific program
export async function GET({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sequences")
    .select("*")
    .eq("program_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// POST a new sequence under a specific program
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Omit<Sequence, "sequence_id"> = await req.json();
  const { sequence_dates } = body;

  const { data, error } = await (await supabase)
    .from("sequences")
    .insert([{ program_id: params.id, sequence_dates }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

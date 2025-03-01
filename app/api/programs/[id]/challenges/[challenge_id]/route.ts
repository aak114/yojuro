import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET a challenge by ID
export async function GET({ params }: { params: { id: string; challenge_id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("challenge_id", params.challenge_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// PATCH - Update a challenge
export async function PATCH(req: Request, { params }: { params: { id: string; challenge_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, start_date, end_date, entry_fee } = body;

  const { data, error } = await supabase
    .from("challenges")
    .update({ name, description, start_date, end_date, entry_fee })
    .eq("challenge_id", params.challenge_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Challenge } from "@/types/types";

// GET - Fetch all challenges under a specific program
export async function GET({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("program_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// POST - Create a new challenge under a specific program
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Omit<Challenge, "challenge_id" | "created_at" | "updated_at"> = await req.json();
  const { name, description, start_date, end_date, entry_fee, status } = body;

  const { data, error } = await supabase
    .from("challenges")
    .insert([{ 
      name, 
      description, 
      start_date, 
      end_date, 
      entry_fee, 
      status, 
      program_id: params.id 
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

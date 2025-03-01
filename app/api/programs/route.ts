import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Program } from "@/types/types";

// GET all programs
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// POST a new program
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Program = await req.json();
  const { name } = body;

  const { data, error } = await (await supabase)
    .from("programs")
    .insert([{ name: name || null }]) // Name is optional, so set it to null if not provided
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

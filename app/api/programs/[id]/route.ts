import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Program } from "@/types/types";

// GET - Fetch program by ID
export async function GET({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("program_id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// PATCH - Update a program
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const body: Program = await req.json();
    const { name } = body;
  
    // Allow name to be nullable and only update if provided
    const updateFields: { name?: string | null } = {};
    if (name !== undefined) updateFields.name = name === "" ? null : name;
  
    const { data, error } = await supabase
      .from("programs")
      .update(updateFields)
      .eq("program_id", params.id)
      .select()
      .single();
  
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
    return NextResponse.json(data, { status: 200 });
  }

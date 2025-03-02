import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await (await supabase)
    .from("challenges")
    .select("*")
    .eq("challenge_id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await (await supabase)
    .from("challenges")
    .update(body)
    .eq("challenge_id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await (await supabase)
    .from("challenges")
    .delete()
    .eq("challenge_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Challenge deleted" }, { status: 200 });
}

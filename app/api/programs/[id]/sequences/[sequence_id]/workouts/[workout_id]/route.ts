import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Workout } from "@/types/types";

// GET - Fetch a specific workout
export async function GET({ params }: { params: { workout_id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("workout_id", params.workout_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// PATCH - Update a workout
export async function PATCH(req: Request, { params }: { params: { workout_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Partial<Omit<Workout, "workout_id" | "sequence_id">> = await req.json();

  const { data, error } = await supabase
    .from("workouts")
    .update(body)
    .eq("workout_id", params.workout_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// DELETE - Remove a workout
export async function DELETE({ params }: { params: { workout_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("workout_id", params.workout_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: "Workout deleted" }, { status: 200 });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Workout } from "@/types/types";

// GET - Fetch all workouts for a sequence
export async function GET({ params }: { params: { sequence_id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("sequence_id", params.sequence_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// POST - Create a new workout for a sequence
export async function POST(req: Request, { params }: { params: { sequence_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: Omit<Workout, "workout_id"> = await req.json();
  const { reps, duration, exercise_type, workout_order, pause_duration } = body;

  const { data, error } = await supabase
    .from("workouts")
    .insert([{ 
      reps, 
      duration, 
      exercise_type, 
      sequence_id: params.sequence_id, 
      workout_order, 
      pause_duration 
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

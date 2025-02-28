import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { reps, duration, workout_dates, exercise_name } = body;

  // Ensure challenge exists
  const { data: challenge, error: challengeError } = await (await supabase)
    .from("challenges")
    .select("challenge_id")
    .eq("challenge_id", params.id)
    .single();

  if (challengeError || !challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  // Validate exercise_name from the exercises list
  const { data: exercises, error: exercisesError } = await (await supabase)
    .from("exercises")
    .select("exercise_id, name");

  if (exercisesError || !exercises.some((e) => e.name === exercise_name)) {
    return NextResponse.json({ error: "Invalid exercise name" }, { status: 400 });
  }

  // Get the exercise_id based on the exercise_name
  const exercise_id = exercises.find((e) => e.name === exercise_name)?.exercise_id;

  // Insert the new workout
  const { data, error } = await (await supabase)
    .from("workouts")
    .insert([
      {
        reps,
        duration,
        workout_dates,
        exercise_id,
        challenge_id: params.id,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

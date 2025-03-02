import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET({ params }: { params: { sequence_id: string; workout_id: string } }) {
  const supabase = await createClient();
  const { sequence_id, workout_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the specific workout for the given sequence_id and workout_id
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('sequence_id', sequence_id)
    .eq('workout_id', workout_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req: Request, { params }: { params: { sequence_id: string; workout_id: string } }) {
  const supabase = await createClient();
  const { sequence_id, workout_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Update the workout with new data
  const { data, error } = await supabase
    .from('workouts')
    .update(body)
    .eq('sequence_id', sequence_id)
    .eq('workout_id', workout_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE({ params }: { params: { sequence_id: string; workout_id: string } }) {
  const supabase = await createClient();
  const { sequence_id, workout_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete the specific workout
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('sequence_id', sequence_id)
    .eq('workout_id', workout_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Workout deleted successfully' }, { status: 200 });
}

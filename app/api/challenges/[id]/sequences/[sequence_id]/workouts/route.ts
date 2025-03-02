import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Workout } from '@/types/types'; // Import Workout type

export async function GET({ params }: { params: { id: string; sequence_id: string } }) {
  const supabase = await createClient();
  const { sequence_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('sequence_id', sequence_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request, { params }: { params: { id: string; sequence_id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: Workout[] = await req.json(); // Ensure body is typed as an array of Workouts

  // Insert single or multiple workouts
  const { data, error } = await supabase
    .from('workouts')
    .upsert(body.map((workout) => ({
      ...workout,
      sequence_id: params.sequence_id, // Correctly reference sequence_id
    })))
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

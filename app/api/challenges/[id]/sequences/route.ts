import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Sequence } from '@/types/types'; // Import Sequence type

// GET route for fetching sequences of a given challenge
export async function GET({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch all sequences for the given challenge_id
  const { data, error } = await supabase
    .from('sequences')
    .select('*')
    .eq('challenge_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// POST route for creating sequences linked to a challenge
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: Sequence[] = await req.json(); // Handle multiple sequences

  // Prepare data to insert (add challenge_id and ensure duration can be null)
  const sequencesToInsert = body.map(sequence => ({
    ...sequence,
    challenge_id: params.id, // Link the sequence to the challenge
    duration: sequence.duration !== undefined ? sequence.duration : null, // Allow duration to be null
  }));

  // Bulk insert sequences linked to the challenge
  const { data, error } = await supabase
    .from('sequences')
    .insert(sequencesToInsert)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET({ params }: { params: { id: string; sequence_id: string } }) {
  const supabase = await createClient();
  const { id, sequence_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the specific sequence for the given challenge_id and sequence_id
  const { data, error } = await supabase
    .from('sequences')
    .select('*')
    .eq('challenge_id', id)
    .eq('sequence_id', sequence_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req: Request, { params }: { params: { id: string; sequence_id: string } }) {
  const supabase = await createClient();
  const { id, sequence_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Update the sequence with new data
  const { data, error } = await supabase
    .from('sequences')
    .update(body)
    .eq('challenge_id', id)
    .eq('sequence_id', sequence_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE({ params }: { params: { id: string; sequence_id: string } }) {
  const supabase = await createClient();
  const { id, sequence_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete the specific sequence
  const { error } = await supabase
    .from('sequences')
    .delete()
    .eq('challenge_id', id)
    .eq('sequence_id', sequence_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Sequence deleted successfully' }, { status: 200 });
}

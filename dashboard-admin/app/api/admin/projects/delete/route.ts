import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Delete the project from the database
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Projet supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

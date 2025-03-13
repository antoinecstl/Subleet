import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    const { project_id, working } = await request.json();

    if (project_id === undefined || working === undefined) {
      return NextResponse.json({ error: 'Project ID and working status are required' }, { status: 400 });
    }

    // Update project status
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ working })
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project updated successfully.', 
      project: updatedProject 
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    const { project_id, working, context } = await request.json();

    if (project_id === undefined) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if neither working nor context is provided
    if (working === undefined && context === undefined) {
      return NextResponse.json({ error: 'Either working status or context must be provided' }, { status: 400 });
    }

    // Prepare update object based on what was provided
    const updateData: { working?: boolean; context?: string } = {};
    if (working !== undefined) updateData.working = working;
    if (context !== undefined) updateData.context = context;

    // Update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
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

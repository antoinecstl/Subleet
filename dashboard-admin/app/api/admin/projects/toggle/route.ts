import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get the current project status
    const { data: projectData, error: fetchError } = await supabase
      .from('projects')
      .select('working')
      .eq('project_id', projectId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentStatus = projectData?.working || false;

    // Toggle the working status
    const { data, error } = await supabase
      .from('projects')
      .update({ working: !currentStatus })
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: `Project status updated successfully to ${!currentStatus ? 'active' : 'inactive'}.`, 
      project: data 
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 });
  }
}

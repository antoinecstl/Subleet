import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const { project_name, project_owner, context } = await request.json();

    if (!project_name || !project_owner) {
      return NextResponse.json({ error: 'Project name and owner are required' }, { status: 400 });
    }

    // Insert into projects
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ 
        project_name, 
        project_owner, 
        context: context || null,
        working: true // Default to active
      }])
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project created successfully.', 
      project: projectData 
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

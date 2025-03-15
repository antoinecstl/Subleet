import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    // Get authentication using Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }
    
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const primaryEmail = user.emailAddresses[0].emailAddress;
    const { project_id, context } = await request.json();

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (context === undefined) {
      return NextResponse.json({ error: 'Context is required' }, { status: 400 });
    }

    // Find client by email
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', primaryEmail)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // First, check if the user owns this project
    const { data: projectData, error: fetchError } = await supabase
      .from('projects')
      .select('project_id, project_owner')
      .eq('project_id', project_id)
      .single();

    if (fetchError || !projectData) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify ownership
    if (projectData.project_owner !== clientData.id) {
      return NextResponse.json({ error: 'You are not authorized to update this project' }, { status: 403 });
    }

    // Update project context
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ context })
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Return the successful response
    return NextResponse.json({ 
      message: 'Project context updated successfully.', 
      project: updatedProject 
    });

  } catch (error) {
    console.error('Error updating project context:', error);
    return NextResponse.json({ error: 'Failed to update project context' }, { status: 500 });
  }
}

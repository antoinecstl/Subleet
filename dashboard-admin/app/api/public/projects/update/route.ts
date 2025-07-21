import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';
import { decryptApiKey } from '@/lib/api-key-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 401 });
    }
    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Find the client by email
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', primaryEmail)
      .single();
      
    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { project_id, project_url } = await request.json();

    // Validate input
    if (project_id === undefined) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!project_url || typeof project_url !== 'string') {
      return NextResponse.json({ error: 'Project URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(project_url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Get the current project and verify ownership
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', project_id)
      .eq('project_owner', clientData.id) // Ensure user owns this project
      .single();
      
    if (fetchError || !currentProject) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }
    
    // Get the vector_store_id associated with the project
    const { data: vectorStore, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', project_id)
      .single();
      
    if (vectorStoreError) {
      console.error('Failed to fetch vector store details:', vectorStoreError);
    }
    
    // Get the assistant_id associated with the project
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', project_id)
      .single();
      
    if (assistantError) {
      console.error('Failed to fetch assistant details:', assistantError);
    }
    
    // Get the encrypted API key associated with the project
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('project_id', project_id)
      .single();
      
    if (apiKeyError) {
      console.error('Failed to fetch API key:', apiKeyError);
    }
    
    // Decrypt the API key if it exists
    let apiKey: string | undefined;
    if (apiKeyData?.encrypted_key && process.env.API_ENCRYPTION_SECRET) {
      try {
        apiKey = decryptApiKey(apiKeyData.encrypted_key, process.env.API_ENCRYPTION_SECRET);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
      }
    }

    // Update project URL in database
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ project_url: project_url })
      .eq('project_id', project_id)
      .eq('project_owner', clientData.id) // Double-check ownership
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project URL:', updateError);
      return NextResponse.json({ error: 'Failed to update project URL' }, { status: 500 });
    }

    // Redeploy the Edge Function with the new URL
    if (process.env.SUPABASE_PROJECT_REF) {
      try {
        await deployEdgeFunction(
          process.env.SUPABASE_PROJECT_REF,
          currentProject.edge_function_slug,
          project_url, // New project URL for CORS
          currentProject.working, // Keep current working status
          currentProject.project_name,
          vectorStore?.openai_vector_id || undefined,
          assistant?.openai_assistant_id || undefined,
          apiKey // Include the decrypted API key
        );
        
        console.log(`Edge Function redeployed with new URL: ${project_url}`);
      } catch (edgeError) {
        console.error('Error redeploying Edge Function:', edgeError);
        // Rollback the database change if edge function deployment fails
        await supabase
          .from('projects')
          .update({ project_url: currentProject.project_url })
          .eq('project_id', project_id);
          
        return NextResponse.json({ 
          error: 'Failed to update Edge Function. Please try again.' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      message: 'Project URL updated successfully.', 
      project: updatedProject 
    });

  } catch (error) {
    console.error('Error updating project URL:', error);
    return NextResponse.json({ error: 'Failed to update project URL' }, { status: 500 });
  }
}

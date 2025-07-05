import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { getAssistant } from '@/lib/vector-store-utils';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    
    if (!projectId) {
      return NextResponse.json({ error: "project_id parameter is required" }, { status: 400 });
    }

    // Verify user auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's email address
    const user = await currentUser();
    if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }
    const primaryEmail = user.emailAddresses[0].emailAddress;

    // Get the client ID first - récupération seulement de l'id nécessaire
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', primaryEmail)
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Now fetch the project and verify ownership - récupération seulement des champs utilisés
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('project_id, project_name, working, creation_timestamp, project_url, edge_function_slug, project_owner')
      .eq('project_id', projectId)
      .single();

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify the user owns this project
    if (projectData.project_owner !== clientData.id) {
      return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
    }

    // Fetch vector store info - récupération seulement de l'openai_vector_id utilisé
    const { data: vectorStoreData } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', projectId)
      .single();
      
    // Fetch assistant info - récupération seulement de l'openai_assistant_id (model retiré car non utilisé)
    const { data: assistantData } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', projectId)
      .single();

    // Si un assistant existe, récupérer ses instructions depuis l'API OpenAI
    let assistantDetails = null;
    if (assistantData?.openai_assistant_id) {
      try {
        assistantDetails = await getAssistant(assistantData.openai_assistant_id);
      } catch (error) {
        console.error('Error fetching assistant details:', error);
      }
    }

    return NextResponse.json({
      project: {
        project_id: projectData.project_id,
        project_name: projectData.project_name,
        working: projectData.working,
        creation_timestamp: projectData.creation_timestamp,
        project_url: projectData.project_url
      },
      vectorStoreId: vectorStoreData?.openai_vector_id || null,
      assistantId: assistantData?.openai_assistant_id || null,
      assistant: assistantDetails ? {
        instructions: assistantDetails.instructions,
        model: assistantDetails.model
      } : null,
      edgeFunctionSlug: projectData?.edge_function_slug || null
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

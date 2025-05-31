import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { deployEdgeFunction } from '@/lib/edge-functions/deploy-utils';
import { decryptApiKey } from '@/lib/api-key-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function PUT(request: Request) {
  try {
    const { project_id, working } = await request.json();

    if (project_id === undefined) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Check if working is provided
    if (working === undefined) {
      return NextResponse.json({ error: 'Working status must be provided' }, { status: 400 });
    }    // Récupérer les informations du projet avant modification pour obtenir l'URL et le nom
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', project_id)
      .single();
      
    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 404 });
    }
    
    // Récupérer le vector_store_id associé au projet
    const { data: vectorStore, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', project_id)
      .single();
      
    if (vectorStoreError) {
      console.error('Failed to fetch vector store details:', vectorStoreError);
      // On continue même si on ne trouve pas le vector_store_id
    }
    
    // Récupérer l'assistant_id associé au projet
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', project_id)
      .single();
      
    if (assistantError) {
      console.error('Failed to fetch assistant details:', assistantError);
      // On continue même si on ne trouve pas l'assistant_id
    }
    
    // Récupérer la clé API encryptée associée au projet
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('project_id', project_id)
      .single();
      
    if (apiKeyError) {
      console.error('Failed to fetch API key:', apiKeyError);
      // On continue même si on ne trouve pas la clé API
    }
    
    // Décrypter la clé API si elle existe
    let apiKey: string | undefined;
    if (apiKeyData?.encrypted_key && process.env.API_ENCRYPTION_SECRET) {
      try {
        apiKey = decryptApiKey(apiKeyData.encrypted_key, process.env.API_ENCRYPTION_SECRET);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        // On continue même si le décryptage échoue
      }
    }

    // Prepare update object based on what was provided
    const updateData: { working?: boolean } = {};
    if (working !== undefined) updateData.working = working;

    // Update project in database
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('project_id', project_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Si le statut d'activation a changé, redéployer la fonction Edge
    if (working !== undefined && process.env.SUPABASE_PROJECT_REF) {
      try {        // Déployer la fonction Edge avec le statut approprié
        await deployEdgeFunction(
          process.env.SUPABASE_PROJECT_REF,
          currentProject.edge_function_slug,
          currentProject.project_url,
          working, // Actif ou inactif
          currentProject.project_name,
          vectorStore?.openai_vector_id || undefined,
          assistant?.openai_assistant_id || undefined,
          apiKey // Inclure la clé API décryptée
        );
        
        console.log(`Edge Function redeployed with status: ${working ? 'active' : 'disabled'}`);
      } catch (edgeError) {
        console.error('Error redeploying Edge Function:', edgeError);
        // On ne fait pas échouer la requête en cas d'erreur de déploiement Edge
      }
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

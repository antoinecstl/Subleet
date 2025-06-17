import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getAssistant } from '@/lib/vector-store-utils';
import { decryptApiKey } from '@/lib/api-key-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    
    if (!projectId) {
      return NextResponse.json({ error: "project_id parameter is required" }, { status: 400 });
    }

    // Fetch project data
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (projectError) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch vector store info
    const { data: vectorStoreData } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', projectId)
      .single();
      
    // Fetch assistant info
    const { data: assistantData } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', projectId)
      .single();

    // Fetch client info for this project
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, name, email, phone, creation_date')
      .eq('id', projectData.project_owner)
      .single();

    // Fetch call history
    const { data: callHistory } = await supabase
      .from('api_calls')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(20);
        // Récupérer les détails complets de l'assistant depuis OpenAI
    let assistant = null;
    if (assistantData?.openai_assistant_id) {
      try {
        assistant = await getAssistant(assistantData.openai_assistant_id);
      } catch (error) {
        console.error('Error fetching assistant details:', error);
        // Ne pas bloquer le reste de la réponse si l'assistant n'est pas récupérable
      }
    }
    
    // Récupérer et décrypter la clé API
    let apiKey = null;
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('project_id', projectId)
      .single();
      
    if (!apiKeyError && apiKeyData?.encrypted_key && process.env.API_ENCRYPTION_SECRET) {
      try {
        apiKey = decryptApiKey(apiKeyData.encrypted_key, process.env.API_ENCRYPTION_SECRET);
      } catch (error) {
        console.error('Error decrypting API key:', error);
        // Ne pas bloquer le reste de la réponse si le décryptage échoue
      }
    }    return NextResponse.json({
      project: projectData,
      clientInfo: clientData || null,
      callHistory: callHistory || [],
      vectorStoreId: vectorStoreData?.openai_vector_id || null,
      assistantId: assistantData?.openai_assistant_id || null,
      assistant: assistant,
      projectUrl: projectData?.project_url || null,
      apiKey: apiKey
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

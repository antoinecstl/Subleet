import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    // Fetch client info for this project
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('id', projectData.project_owner)
      .single();

    // Fetch the API key
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('project_id', projectId)
      .single();

    // Fetch call history
    const { data: callHistory } = await supabase
      .from('api_calls')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(20);

    return NextResponse.json({
      project: projectData,
      clientInfo: clientData || null,
      apiKey: apiKeyData?.api_key || null,
      callHistory: callHistory || [],
      vectorStoreId: vectorStoreData?.openai_vector_id || null
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

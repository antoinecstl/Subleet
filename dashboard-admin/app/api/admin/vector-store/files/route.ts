import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { listFilesInVectorStore } from '../../../../../lib/vector-store-utils';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Récupérer l'ID du Vector Store associé au projet
    const { data: vectorStoreData, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', projectId)
      .single();

    if (vectorStoreError) {
      return NextResponse.json({ error: 'Vector Store not found for this project' }, { status: 404 });
    }

    // Récupérer la liste des fichiers dans le Vector Store
    const files = await listFilesInVectorStore(vectorStoreData.openai_vector_id);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { removeFileFromVectorStore } from '../../../../../lib/vector-store-utils';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const fileId = searchParams.get('file_id');

    if (!projectId || !fileId) {
      return NextResponse.json({ error: 'Project ID and file ID are required' }, { status: 400 });
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

    // Supprimer le fichier du Vector Store
    await removeFileFromVectorStore(vectorStoreData.openai_vector_id, fileId);

    return NextResponse.json({ 
      message: 'File removed successfully from Vector Store'
    });
  } catch (error) {
    console.error('Error removing file:', error);
    return NextResponse.json({ error: 'Failed to remove file' }, { status: 500 });
  }
}
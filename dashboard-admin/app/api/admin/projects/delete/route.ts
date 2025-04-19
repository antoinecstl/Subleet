import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { deleteVectorStore } from '../../../../../lib/vector-store-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Récupérer l'ID du Vector Store avant de supprimer le projet
    const { data: vectorStoreData, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', id)
      .single();

    if (vectorStoreError && vectorStoreError.code !== 'PGRST116') {
      // PGRST116 signifie "no rows returned", ce qui est acceptable
      console.error('Error fetching vector store:', vectorStoreError);
    }

    // Supprimer le vector store si trouvé
    if (vectorStoreData && vectorStoreData.openai_vector_id) {
      try {
        await deleteVectorStore(vectorStoreData.openai_vector_id);
      } catch (error) {
        console.error('Error deleting vector store:', error);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }

    // DELETE CASCADE s'occupera de supprimer les entrées dans vector_stores
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Projet supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { deleteVectorStore, deleteAssistant } from '../../../../../lib/vector-store-utils';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Récupérer l'ID du Vector Store et de l'Assistant avant de supprimer le projet
    const { data: vectorStoreData, error: vectorStoreError } = await supabase
      .from('vector_stores')
      .select('openai_vector_id')
      .eq('project_id', id)
      .single();

    const { data: assistantData, error: assistantError } = await supabase
      .from('assistants')
      .select('openai_assistant_id')
      .eq('project_id', id)
      .single();

    // Supprimer le vector store si trouvé
    if (vectorStoreData && vectorStoreData.openai_vector_id) {
      try {
        await deleteVectorStore(vectorStoreData.openai_vector_id);
      } catch (error) {
        console.error('Error deleting vector store:', error);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }

    // Supprimer l'assistant si trouvé
    if (assistantData && assistantData.openai_assistant_id) {
      try {
        await deleteAssistant(assistantData.openai_assistant_id);
      } catch (error) {
        console.error('Error deleting assistant:', error);
        // Continuer malgré l'erreur pour ne pas bloquer la suppression du projet
      }
    }

    // DELETE CASCADE s'occupera de supprimer les entrées dans vector_stores et assistants
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
